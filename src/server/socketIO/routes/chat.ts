import sharedSession from "express-socket.io-session";
import { Server } from "socket.io";
import { ISocketIOMessage } from "./../../../types/types";
import Room, { IRoom } from "./../../models/room";
import { IUser } from "./../../models/user";
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

    let usersInRoom: IRoomUser[] = [];

    chat.on("connection", async (socket) => {
        const roomId = socket.handshake.headers.referer.split("room=").pop() as string;
        const user = socket.handshake.session.user;

        usersInRoom.push({
            user,
            socketId: socket.id,
        });

        try {
            const room = await Room.addUserToRoom(roomId, user);
            Room.emit("roomUpdate", room);
        } catch (e) {
            console.log(e);
        }

        // Join the room and send a welcome message
        socket.on("join", async () => {
            try {
                socket.join(roomId);
                const room = await Room.findById(roomId);
                socket.emit("message", generateMessage(`Welcome to ${room.name}, ${user.username}`));
                socket.broadcast.to(roomId).emit("message", generateMessage(`${user.username} has joined`));
                chat.to(roomId).emit("userListUpdate", usersInRoom);
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
        socket.on("disconnect", async () => {
            try {
                const room = await Room.removeUserFromRoom(roomId, user);
                usersInRoom = usersInRoom.filter((roomUser) => {
                    return roomUser.socketId !== socket.id;
                });
                Room.emit("roomUpdate", room);
                chat.to(roomId).emit("userListUpdate", usersInRoom);
                socket.broadcast.to(roomId).emit("message", generateMessage(`${user.username} has left`));
                // TODO delete when empty?
            } catch (e) {
                console.log(e);
            }
        });
    });
};

export default chatSocket;
