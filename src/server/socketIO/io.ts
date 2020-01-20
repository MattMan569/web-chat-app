import sharedSession from "express-socket.io-session";
import socketio from "socket.io";
import Room from "./../models/room";
import server from "./../server";
import { session } from "./../server";

const io = socketio(server);
io.use(sharedSession(session));

io.on("connection", async (socket) => {
    // Add the user to the room's user array
    try {
        await (await Room.findById(socket.handshake.headers.referer.split("room=").pop())).addUserToRoom(socket.handshake.session.user);
    } catch (e) {
        console.log(e);
    }

    // Remove the user from the room's array of users on disconnect
    socket.on("disconnect", async () => {
        try {
            await (await Room.findById(socket.handshake.headers.referer.split("room=").pop())).removeUserFromRoom(socket.handshake.session.user);
        } catch (e) {
            console.log(e);
        }
    });
});
