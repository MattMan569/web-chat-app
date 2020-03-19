"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_socket_io_session_1 = __importDefault(require("express-socket.io-session"));
var room_1 = __importDefault(require("./../../models/room"));
var server_1 = require("./../../server");
// Socket connections from the index page
// Keep the client's room list up to date
var indexSocket = function (io) {
    var index = io.of("/index");
    index.use(express_socket_io_session_1.default(server_1.session));
    // Mongoose event listeners
    room_1.default.on("roomUpdate", function (room) {
        index.emit("roomUpdate", room);
    });
    room_1.default.on("roomDelete", function (room) {
        index.emit("roomDelete", room);
    });
};
exports.default = indexSocket;
//# sourceMappingURL=index.js.map