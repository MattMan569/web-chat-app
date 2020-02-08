import { Socket } from "dgram";
import sharedSession from "express-socket.io-session";
import { Server } from "socket.io";
import { ISocketIOMessage } from "./../../../types/types";
import Room, { IRoom } from "./../../models/room";
import { IUser } from "./../../models/user";
import User from "./../../models/user";
import { session } from "./../../server";
import { generateMessage } from "./../util/message";

export interface IRoomUser {
    user: IUser;
    socketId: string;
}

// Socket connection from the chat page
// Handle the sending of messages and the room db
const chatSocket = (io: Server) => {
    const chat = io.of("/chat");
    chat.use(sharedSession(session));

    // let usersInRoom: IRoomUser[] = [];

    chat.on("connection", async (socket) => {
        const roomId = socket.handshake.headers.referer.split("room=").pop() as string;
        const user = socket.handshake.session.user;
        // const userAlreadyInRoom = (await Room.find({ "_id": roomId, "users.user": user._id })).length > 0;
        const userAlreadyInRoom = (await Room.findOne({ "_id": roomId, "users.user": user._id }));

        // Kick the other user instance and remove it from the db
        if (userAlreadyInRoom) {
            const duplicateUser = userAlreadyInRoom.users[0];
            const duplicateSocket = chat.connected[duplicateUser.socketId];

            try {
                await Room.removeUserFromRoom(roomId, user);

                duplicateSocket.emit("message", {
                    message: "You have been kicked.",
                    createdAt: new Date(),
                    sender: "SERVER",
                });
                duplicateSocket.disconnect();
            } catch (e) {
                console.log(e);
            }
        }

        // Join the room and send a welcome message
        socket.on("join", async () => {
            try {
                // const room = await (await Room.findById(roomId)).populate("users.user").execPopulate();
                const room = await (await Room.addUserToRoom(roomId, user, socket.id)).populate("users.user").execPopulate();
                Room.emit("roomUpdate", room);
                socket.join(roomId);
                socket.emit("message", generateMessage(`Welcome to ${room.name}, ${user.username}`));
                socket.broadcast.to(roomId).emit("message", generateMessage(`${user.username} has joined`));
                chat.to(roomId).emit("userListUpdate", room.users);
            } catch (e) {
                console.log(e);
            }
        });

        // Send the specified message to all clients in the room
        socket.on("sendMessage", (message: string, callback) => {
            chat.to(roomId).emit("message", {
                message,
                createdAt: new Date(),
                sender: user.username,
                _id: user._id,
            } as ISocketIOMessage);
            callback();
        });

        // Kick the specified user
        socket.on("kick", (socketId: string) => {
            try {
                const targetUser = chat.connected[socketId];

                targetUser.emit("message", {
                    message: "You have been kicked.",
                    createdAt: new Date(),
                    sender: "SERVER",
                });

                targetUser.disconnect();
            } catch (e) {
                console.log(e);
            }
        });

        // Remove the user from the room
        // TODO do not run on user kick
        socket.on("disconnect", async () => {
            try {
                const room = await (await Room.removeUserFromRoom(roomId, user)).populate("users.user").execPopulate();
                Room.emit("roomUpdate", room);
                chat.to(roomId).emit("userListUpdate", room.users);
                socket.broadcast.to(roomId).emit("message", generateMessage(`${user.username} has left`));
                // TODO delete when empty?
            } catch (e) {
                console.log(e);
            }
        });
    });
};

export default chatSocket;
