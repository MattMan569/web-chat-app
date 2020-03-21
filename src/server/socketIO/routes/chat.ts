import sharedSession from "express-socket.io-session";
import { Server } from "socket.io";
import { ISocketIOMessage } from "./../../../types/types";
import Room from "./../../models/room";
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

    chat.on("connection", async (socket) => {
        const roomId = socket.handshake.headers.referer.split("room=").pop() as string;
        const user = socket.handshake.session.user;
        const userAlreadyInRoom = (await Room.findOne({ "_id": roomId, "users.user": user._id }));

        // Kick the other user instance and remove it from the db
        if (userAlreadyInRoom) {
            const duplicateUser = userAlreadyInRoom.users[0];
            const duplicateSocket = chat.connected[duplicateUser.socketId];

            try {
                await Room.removeUserFromRoom(roomId, user);

                duplicateSocket.emit("message", generateMessage("You have been kicked by the server. (You joined multiple times)"));
                duplicateSocket.disconnect();
            } catch (e) {
                console.log(e);
            }
        }

        // Join the room and send a welcome message
        socket.on("join", async () => {
            try {
                const room = await (await Room.addUserToRoom(roomId, user, socket.id)).populate("users.user").execPopulate();
                Room.emit("roomUpdate", room);
                socket.join(roomId);
                socket.emit("userData", user);
                socket.emit("message", generateMessage(`Welcome to ${room.name}, ${user.username}`));
                socket.broadcast.to(roomId).emit("message", generateMessage(`${user.username} has joined`));
                chat.to(roomId).emit("userListUpdate", room);
            } catch (e) {
                console.log(e);
            }
        });

        // Send the specified message to all clients in the room
        socket.on("sendMessage", (message: string, callback) => {
            chat.to(roomId).emit("message", {
                message,
                createdAt: (new Date()).toLocaleString().split(","),
                sender: user.username,
                _id: user._id,
            } as ISocketIOMessage);
            callback();
        });

        // Kick the specified user
        socket.on("kick", async (socketId: string) => {
            try {
                const room = await Room.findById(roomId);

                // Owner is object due to ref property
                // tslint:disable-next-line: triple-equals
                if (room.owner != user._id) {
                    socket.emit("message", generateMessage("Only room owners may kick users."));
                    return;
                }

                const targetUser = chat.connected[socketId];

                targetUser.emit("message", generateMessage("You have been kicked by the room owner."));
                targetUser.disconnect();
            } catch (e) {
                console.log(e);
            }
        });

        // Ban the specified user
        socket.on("ban", async (userId: string) => {
            try {
                const bannedUser = await User.findById(userId);
                Room.banUser(roomId, bannedUser);
            } catch (e) {
                console.log(e);
            }
        });

        // Remove the user from the room
        socket.on("disconnect", async () => {
            try {
                const room = await (await Room.removeUserFromRoom(roomId, user)).populate("users.user").execPopulate();
                Room.emit("roomUpdate", room);
                chat.to(roomId).emit("userListUpdate", room);
                socket.broadcast.to(roomId).emit("message", generateMessage(`${user.username} has left`));
            } catch (e) {
                console.log(e);
            } finally {
                // Deauthorize the user for the current room
                socket.handshake.session.reload((err) => {
                    if (err) {
                        return console.log("chat.ts disconnect", err);
                    }
                    socket.handshake.session.authorizedRooms =
                        socket.handshake.session.authorizedRooms.filter((curRoomId) => {
                            return curRoomId !== roomId;
                        });
                    socket.handshake.session.save((err2) => {
                        if (err2) {
                            return console.log("chat.ts disconnect", err2);
                        }
                    });
                });
            }
        });
    });
};

export default chatSocket;
