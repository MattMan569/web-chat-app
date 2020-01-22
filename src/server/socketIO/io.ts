import sharedSession from "express-socket.io-session";
import socketio from "socket.io";
import { ISocketIOMessage } from "./../../types/types";
import Room from "./../models/room";
import server, { session } from "./../server";
import { generateMessage } from "./util/message";

const io = socketio(server);
io.use(sharedSession(session)); // Use the same session as Express

io.on("connection", async (socket) => {
    const roomId = socket.handshake.headers.referer.split("room=").pop();
    const user = socket.handshake.session.user;

    // Add the user to the room's user array
    try {
        const room = await Room.findById(roomId);
        await room.addUserToRoom(user);
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
        io.to(roomId).emit("message",  {
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
        } catch (e) {
            console.log(e);
        }
    });
});
