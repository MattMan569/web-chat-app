import socketio from "socket.io";
import server from "./../server";
import chatSocket from "./routes/chat";
import indexSocket from "./routes/index";

const io = socketio(server);

chatSocket(io);
indexSocket(io);
