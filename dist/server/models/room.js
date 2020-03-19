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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var cryptr_1 = __importDefault(require("cryptr"));
var mongoose_1 = __importStar(require("mongoose"));
var user_1 = __importDefault(require("./user"));
var roomSchema = new mongoose_1.default.Schema({
    capacity: {
        max: 100,
        min: 1,
        required: true,
        type: Number,
    },
    name: {
        maxlength: 50,
        required: true,
        trim: true,
        type: String,
        unique: true,
    },
    owner: {
        ref: user_1.default,
        required: true,
        type: mongoose_1.Schema.Types.ObjectId,
    },
    password: {
        trim: true,
        type: String,
    },
    locked: {
        type: Boolean,
    },
    users: [{
            socketId: String,
            user: {
                ref: user_1.default,
                type: mongoose_1.Schema.Types.ObjectId,
            },
        }],
    bannedUsers: [{
            ref: user_1.default,
            type: mongoose_1.Schema.Types.ObjectId,
        }],
}, {
    timestamps: true,
});
roomSchema.methods.comparePassword = function (password) {
    var roomPassword = new cryptr_1.default(process.env.AES_SECRET).decrypt(this.password);
    return roomPassword === password;
};
roomSchema.methods.toJSON = function () {
    var room = this.toObject();
    delete room.password;
    return room;
};
roomSchema.statics.addUserToRoom = function (roomId, user, socketId) { return __awaiter(void 0, void 0, void 0, function () {
    var userObj;
    return __generator(this, function (_a) {
        userObj = {
            socketId: socketId,
            user: user._id,
        };
        return [2 /*return*/, Room.findByIdAndUpdate(roomId, {
                $push: { users: userObj },
            }, {
                new: true,
            }).exec()];
    });
}); };
roomSchema.statics.removeUserFromRoom = function (roomId, user) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, Room.findByIdAndUpdate(roomId, {
                $pull: { users: { user: user._id } },
            }, {
                new: true,
            }).exec()];
    });
}); };
roomSchema.statics.findByRoomName = function (name) { return __awaiter(void 0, void 0, void 0, function () {
    var room;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Room.findOne({ name: name })];
            case 1:
                room = _a.sent();
                if (!room) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, room];
        }
    });
}); };
// Add the user to the room's banned user list
roomSchema.statics.banUser = function (roomId, user) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, Room.findByIdAndUpdate(roomId, {
                $addToSet: {
                    bannedUsers: user._id,
                },
            }, {
                new: true,
            }).exec()];
    });
}); };
// Remove the user from the room's banned user list
roomSchema.statics.unbanUser = function (roomId, user) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, Room.findByIdAndUpdate(roomId, {
                $pull: { bannedUsers: user._id },
            }, {
                new: true,
            }).exec()];
    });
}); };
roomSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Encrypt the password
            if (this.isModified("password")) {
                this.locked = this.password !== "";
                this.password = new cryptr_1.default(process.env.AES_SECRET).encrypt(this.password);
            }
            next();
            return [2 /*return*/];
        });
    });
});
var Room = mongoose_1.default.model("Room", roomSchema);
exports.default = Room;
//# sourceMappingURL=room.js.map