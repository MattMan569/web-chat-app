"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = __importDefault(require("socket.io"));
var server_1 = __importDefault(require("./../server"));
var chat_1 = __importDefault(require("./routes/chat"));
var index_1 = __importDefault(require("./routes/index"));
var io = socket_io_1.default(server_1.default);
chat_1.default(io);
index_1.default(io);
//# sourceMappingURL=io.js.map