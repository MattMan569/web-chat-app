import sharedSession from "express-socket.io-session";
import { Server } from "socket.io";
import { ISocketIOMessage } from "./../../../types/types";
import Room from "./../../models/room";
import { session } from "./../../server";
import { generateMessage } from "./../util/message";

// Socket connection from the chat page
// Handle the sending of messages and the room db
const chatSocket = (io: Server) => {
    const chat = io.of("/chat");
    chat.use(sharedSession(session));

    chat.on("connection", async (socket) => {
        const roomId = socket.handshake.headers.referer.split("room=").pop();
        const user = socket.handshake.session.user;

        try {
            await (await Room.findById(roomId)).addUserToRoom(user);
        } catch (e) {
            console.log(e);
        }

        // Join the room and send a welcome message
        socket.on("join", async () => {
            socket.join(roomId);
            const room = await Room.findById(roomId);
            socket.emit("message", generateMessage(`Welcome to ${room.name}, ${user.username}`));
            socket.broadcast.to(roomId).emit("message", generateMessage(`${user.username} has joined`));
        });

        // Send the specified message to all clients in the room
        socket.on("sendMessage", (message: string, callback) => {
            chat.to(roomId).emit("message", {
                message,
                createdAt: new Date(),
                sender: user.username,
            } as ISocketIOMessage);
            callback();
        });

        // Remove the user from the room
        socket.on("disconnect", async () => {
            try {
                const room = await Room.findById(roomId);
                await room.removeUserFromRoom(user);
                socket.broadcast.to(roomId).emit("message", generateMessage(`${user.username} has left`));
                // TODO delete when empty?
            } catch (e) {
                console.log(e);
            }
        });
    });
};

export default chatSocket;
