"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_socket_io_session_1 = __importDefault(require("express-socket.io-session"));
var room_1 = __importDefault(require("./../../models/room"));
var user_1 = __importDefault(require("./../../models/user"));
var server_1 = require("./../../server");
var message_1 = require("./../util/message");
// Socket connection from the chat page
// Handle the sending of messages and the room db
var chatSocket = function (io) {
    var chat = io.of("/chat");
    chat.use(express_socket_io_session_1.default(server_1.session));
    chat.on("connection", function (socket) { return __awaiter(void 0, void 0, void 0, function () {
        var roomId, user, userAlreadyInRoom, duplicateUser, duplicateSocket, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    roomId = socket.handshake.headers.referer.split("room=").pop();
                    user = socket.handshake.session.user;
                    return [4 /*yield*/, room_1.default.findOne({ "_id": roomId, "users.user": user._id })];
                case 1:
                    userAlreadyInRoom = (_a.sent());
                    if (!userAlreadyInRoom) return [3 /*break*/, 5];
                    duplicateUser = userAlreadyInRoom.users[0];
                    duplicateSocket = chat.connected[duplicateUser.socketId];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, room_1.default.removeUserFromRoom(roomId, user)];
                case 3:
                    _a.sent();
                    duplicateSocket.emit("message", message_1.generateMessage("You have been kicked by the server. (You joined multiple times)"));
                    duplicateSocket.disconnect();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [3 /*break*/, 5];
                case 5:
                    // Join the room and send a welcome message
                    socket.on("join", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var room, e_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    return [4 /*yield*/, room_1.default.addUserToRoom(roomId, user, socket.id)];
                                case 1: return [4 /*yield*/, (_a.sent()).populate("users.user").execPopulate()];
                                case 2:
                                    room = _a.sent();
                                    room_1.default.emit("roomUpdate", room);
                                    socket.join(roomId);
                                    socket.emit("userData", user);
                                    socket.emit("message", message_1.generateMessage("Welcome to " + room.name + ", " + user.username));
                                    socket.broadcast.to(roomId).emit("message", message_1.generateMessage(user.username + " has joined"));
                                    chat.to(roomId).emit("userListUpdate", room);
                                    return [3 /*break*/, 4];
                                case 3:
                                    e_2 = _a.sent();
                                    console.log(e_2);
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Send the specified message to all clients in the room
                    socket.on("sendMessage", function (message, callback) {
                        chat.to(roomId).emit("message", {
                            message: message,
                            createdAt: (new Date()).toLocaleString().split(","),
                            sender: user.username,
                            _id: user._id,
                        });
                        callback();
                    });
                    // Kick the specified user
                    socket.on("kick", function (socketId) { return __awaiter(void 0, void 0, void 0, function () {
                        var room, targetUser, e_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, room_1.default.findById(roomId)];
                                case 1:
                                    room = _a.sent();
                                    // Owner is object due to ref property
                                    // tslint:disable-next-line: triple-equals
                                    if (room.owner != user._id) {
                                        socket.emit("message", message_1.generateMessage("Only room owners may kick users."));
                                        return [2 /*return*/];
                                    }
                                    targetUser = chat.connected[socketId];
                                    targetUser.emit("message", message_1.generateMessage("You have been kicked by the room owner."));
                                    targetUser.disconnect();
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_3 = _a.sent();
                                    console.log(e_3);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Ban the specified user
                    socket.on("ban", function (userId) { return __awaiter(void 0, void 0, void 0, function () {
                        var bannedUser, e_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, user_1.default.findById(userId)];
                                case 1:
                                    bannedUser = _a.sent();
                                    room_1.default.banUser(roomId, bannedUser);
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_4 = _a.sent();
                                    console.log(e_4);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Remove the user from the room
                    socket.on("disconnect", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var room, e_5;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, 4, 5]);
                                    return [4 /*yield*/, room_1.default.removeUserFromRoom(roomId, user)];
                                case 1: return [4 /*yield*/, (_a.sent()).populate("users.user").execPopulate()];
                                case 2:
                                    room = _a.sent();
                                    room_1.default.emit("roomUpdate", room);
                                    chat.to(roomId).emit("userListUpdate", room);
                                    socket.broadcast.to(roomId).emit("message", message_1.generateMessage(user.username + " has left"));
                                    return [3 /*break*/, 5];
                                case 3:
                                    e_5 = _a.sent();
                                    console.log(e_5);
                                    return [3 /*break*/, 5];
                                case 4:
                                    // Deauthorize the user for the current room
                                    socket.handshake.session.reload(function (err) {
                                        if (err) {
                                            return console.log("chat.ts disconnect", err);
                                        }
                                        socket.handshake.session.authorizedRooms =
                                            socket.handshake.session.authorizedRooms.filter(function (curRoomId) {
                                                return curRoomId !== roomId;
                                            });
                                        socket.handshake.session.save(function (err2) {
                                            if (err2) {
                                                return console.log("chat.ts disconnect", err2);
                                            }
                                        });
                                    });
                                    return [7 /*endfinally*/];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    }); });
};
exports.default = chatSocket;
//# sourceMappingURL=chat.js.map