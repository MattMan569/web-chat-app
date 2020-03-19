"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var cryptr_1 = __importDefault(require("cryptr"));
var express_1 = __importDefault(require("express"));
var auth_1 = __importDefault(require("../middleware/auth"));
var roomOwner_1 = __importDefault(require("../middleware/roomOwner"));
var room_1 = __importDefault(require("../models/room"));
var user_1 = __importDefault(require("./../models/user"));
var routerOptions_1 = require("./util/routerOptions");
var router = express_1.default.Router();
// Create a room
router.post("/rooms/create", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1.default.findByUsername(req.session.user.username)];
            case 1:
                user = _a.sent();
                // The current user is the room's owner
                req.body.owner = user._id;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, new room_1.default(req.body).save(function (e, room) {
                        if (e) {
                            console.log(e);
                            // TODO parse 'e' and send helpful error message
                            res.status(400).send("Error");
                            return;
                        }
                        // Authorize the creator for the new room
                        req.session.authorizedRooms.push(room._id);
                        // Send the URL to redirect to
                        res.send("/chat?room=" + room._id);
                    })];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                e_1 = _a.sent();
                console.log(e_1);
                res.status(400).send(e_1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Ban the specified user
router.post("/rooms/ban", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var roomId, username, user, _a, _b, e_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                roomId = req.body.roomId;
                username = req.body.username;
                return [4 /*yield*/, user_1.default.findOne({ username: username })];
            case 1:
                user = _c.sent();
                if (!user) {
                    return [2 /*return*/, res.status(400).send("Invalid username")];
                }
                _b = (_a = res).send;
                return [4 /*yield*/, room_1.default.banUser(roomId, user)];
            case 2:
                _b.apply(_a, [_c.sent()]);
                return [3 /*break*/, 4];
            case 3:
                e_2 = _c.sent();
                console.log(e_2);
                res.status(500).send(e_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Unban the specified user
router.post("/rooms/unban", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var roomId, userId, user, _a, _b, e_3;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                roomId = req.body.roomId;
                userId = req.body.userId;
                return [4 /*yield*/, user_1.default.findById(userId)];
            case 1:
                user = _c.sent();
                if (!user) {
                    return [2 /*return*/, res.status(400).send("Invalid user ID")];
                }
                _b = (_a = res).send;
                return [4 /*yield*/, room_1.default.unbanUser(roomId, user)];
            case 2:
                _b.apply(_a, [_c.sent()]);
                return [3 /*break*/, 4];
            case 3:
                e_3 = _c.sent();
                console.log(e_3);
                res.status(500).send(e_3);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Authorize the user for the specified room
router.post("/rooms/join/:id", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var roomId, password, room, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                roomId = req.params.id;
                password = req.body.password;
                // User was already authorized
                // TODO consider removing, auth then remove on join
                // so password must always be entered
                if (req.session.authorizedRooms.includes(roomId)) {
                    return [2 /*return*/, res.send()];
                }
                return [4 /*yield*/, room_1.default.findById(roomId)];
            case 1:
                room = _a.sent();
                // Room not found
                if (!room) {
                    return [2 /*return*/, res.status(404).redirect("/")];
                }
                // Room capacity has been reached
                if (room.users.length >= room.capacity) {
                    return [2 /*return*/, res.status(400).send("Room is full")];
                }
                // Check the provided password against the room's password
                if (room.comparePassword(password)) {
                    // Authorize the user to enter the room
                    req.session.authorizedRooms.push(roomId);
                    // Must save to prevent race conditions with roomAuth
                    req.session.save(function (err) {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        return res.send();
                    });
                }
                else {
                    // Password mismatch
                    res.status(401).send("Incorrect password");
                }
                return [3 /*break*/, 3];
            case 2:
                e_4 = _a.sent();
                res.status(500).send("Internal server error");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// TODO make sure requester is room owner
// Change the room's name
router.patch("/rooms/name", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var roomId, room, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                roomId = req.headers.referer.split("/").pop();
                return [4 /*yield*/, room_1.default.findByIdAndUpdate(roomId, {
                        name: req.body.name,
                    }, {
                        new: true,
                    })];
            case 1:
                room = _a.sent();
                room_1.default.emit("roomUpdate", room);
                res.send(room);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                if (error_1.codeName === "DuplicateKey") {
                    res.status(400).send("Room name is already taken.");
                    return [2 /*return*/];
                }
                console.log(error_1);
                res.status(500).send("Internal server error.");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Change the room's password
router.patch("/rooms/password", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var roomId, password, locked, room, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                roomId = req.headers.referer.split("/").pop();
                password = new cryptr_1.default(process.env.AES_SECRET).encrypt(req.body.password);
                locked = req.body.password !== "";
                return [4 /*yield*/, room_1.default.findByIdAndUpdate(roomId, {
                        password: password,
                        locked: locked,
                    }, {
                        new: true,
                    })];
            case 1:
                room = _a.sent();
                res.send({
                    room: room,
                    password: req.body.password,
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.log(error_2);
                res.status(500).send("Internal server error");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Change the room's capacity
router.patch("/rooms/capacity", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var roomId, capacity, room, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                roomId = req.headers.referer.split("/").pop();
                capacity = req.body.capacity;
                if (capacity < 1 || capacity > 100) {
                    res.status(400).send("Invalid capacity value");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, room_1.default.findByIdAndUpdate(roomId, {
                        capacity: req.body.capacity,
                    }, {
                        new: true,
                    })];
            case 1:
                room = _a.sent();
                room_1.default.emit("roomUpdate", room);
                res.send(room);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.log(error_3);
                res.status(500).send("Internal server error");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get all rooms
router.get("/rooms", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = res).send;
                return [4 /*yield*/, room_1.default.find()];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
// Get a specific room
router.get("/rooms/:id", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.send(room_1.default.findById(req.params.id).exec());
        return [2 /*return*/];
    });
}); });
// Show the room's cofiguration page
router.get("/rooms/config/:id", [auth_1.default, roomOwner_1.default], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var room;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, room_1.default.findById(req.params.id).populate("bannedUsers", "username")];
            case 1: return [4 /*yield*/, (_a.sent()).execPopulate()];
            case 2:
                room = _a.sent();
                res.render("config", __assign(__assign({}, routerOptions_1.getRouterOptions(req, "Configure - " + routerOptions_1.websiteInfo.websiteTitle)), { room: room }));
                return [2 /*return*/];
        }
    });
}); });
router.delete("/rooms/:id", [auth_1.default, roomOwner_1.default], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var room, e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, room_1.default.findByIdAndDelete(req.params.id)];
            case 1:
                room = _a.sent();
                room_1.default.emit("roomDelete", room);
                res.send(room);
                return [3 /*break*/, 3];
            case 2:
                e_5 = _a.sent();
                console.trace(e_5);
                res.status(500).send(e_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
//# sourceMappingURL=room.js.map