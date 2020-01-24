import sharedSession from "express-socket.io-session";
import { Server } from "socket.io";
import Room, { IRoom } from "./../../models/room";
import { session } from "./../../server";

// Socket connections from the index page
// Keep the client's room list up to date
const indexSocket = (io: Server) => {
    const index = io.of("/index");
    index.use(sharedSession(session));

    index.on("connection", async (socket) => {
        console.log("index connection");
    });

    const sendEvent = (event: string, room: IRoom) => {
        index.emit(event, room);
    };

    // Mongoose event listeners

    Room.on("roomUpdate", (room: IRoom) => {
        sendEvent("roomUpdate", room);
    });
};

export default indexSocket;