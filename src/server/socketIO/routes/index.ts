import sharedSession from "express-socket.io-session";
import { Server } from "socket.io";
import { session } from "./../../server";

// Socket connections from the index page
// Keep the client's room list up to date
const indexSocket = (io: Server) => {
    const index = io.of("/index");
    index.use(sharedSession(session));

    index.on("connection", async (socket) => {
        console.log("index connection");
    });
};

export default indexSocket;
