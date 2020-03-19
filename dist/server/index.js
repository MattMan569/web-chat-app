"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = __importDefault(require("./server"));
require("./socketIO/io");
var port = process.env.PORT;
server_1.default.listen(port, function () {
    console.log("Server is up on port " + port);
});
//# sourceMappingURL=index.js.map