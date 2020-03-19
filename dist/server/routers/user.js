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
var express_1 = __importDefault(require("express"));
var multer_1 = __importDefault(require("multer"));
var sharp_1 = __importDefault(require("sharp"));
var auth_1 = __importDefault(require("../middleware/auth"));
var profile_1 = __importDefault(require("../models/profile"));
var user_1 = __importDefault(require("../models/user"));
var routerOptions_1 = require("./util/routerOptions");
var router = express_1.default.Router();
var upload = multer_1.default({
    limits: {
        fileSize: 1048576,
    },
    fileFilter: function (req, file, callback) {
        try {
            // Images only
            if (!file.originalname.match(/\.(tiff?|pjp(eg)?|jfif|tif|gif|svgz?|bmp|png|jpe?g?|webp|ico|xbm|dib|ai|drw|pct|psp|xcf|psd|raw)$/i)) {
                callback(new Error("Incorrect file format"));
            }
            callback(undefined, true);
        }
        catch (e) {
            callback(e);
        }
    },
});
// Setup the session
var createSession = function (session, user) {
    var userObj = user.toObject();
    delete userObj.password;
    delete userObj.avatar;
    session.authorizedRooms = [];
    session.user = userObj;
    session.loggedIn = true;
};
// Create a new user and log in
router.post("/users", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, user_1.default.create(req.body)];
            case 1:
                user = _a.sent();
                profile_1.default.create({
                    userId: user._id,
                    description: "Edit me!",
                    online: true,
                });
                createSession(req.session, user);
                res.redirect("/");
                return [3 /*break*/, 3];
            case 2:
                e_1 = _a.sent();
                res.status(400).send(e_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Upload a profile picture
router.post("/users/upload/avatar", [auth_1.default, upload.single("avatar")], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var image, user, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, sharp_1.default(req.file.buffer).png().resize(250, 250).toBuffer()];
            case 1:
                image = _a.sent();
                return [4 /*yield*/, user_1.default.findByIdAndUpdate(req.session.user._id, {
                        avatar: image,
                    }, {
                        new: true,
                    })];
            case 2:
                user = _a.sent();
                res.send("data:image/png;base64," + Buffer.from(user.avatar).toString("base64"));
                return [3 /*break*/, 4];
            case 3:
                e_2 = _a.sent();
                console.trace(e_2);
                res.status(500).send(e_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); }, function (error, req, res, next) {
    console.log(error);
    res.status(400).send({
        error: error.message,
    });
});
// Log in as an existing user
router.post("/users/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var username, password, user, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = req.body.username;
                password = req.body.password;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, user_1.default.findByUsernameAndPassword(username, password)];
            case 2:
                // Try to find user by username and password
                user = _a.sent();
                // User not found with provided credentials
                if (!user) {
                    return [2 /*return*/, res.status(400).send("Your login information is invalid.")];
                }
                createSession(req.session, user);
                res.send("/");
                return [3 /*break*/, 4];
            case 3:
                e_3 = _a.sent();
                console.log(e_3);
                return [2 /*return*/, res.status(500).send(e_3)];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Log out
router.get("/users/logout", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            req.session.destroy(function (err) {
                if (err) {
                    console.log(err);
                    res.status(500).send(err);
                    return;
                }
            });
            res.redirect("/login");
        }
        catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
        return [2 /*return*/];
    });
}); });
// Get the information of the user making the request
router.get("/users/me", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, e_4;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _b = (_a = res).send;
                return [4 /*yield*/, user_1.default.findById(req.session.user._id)];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [3 /*break*/, 3];
            case 2:
                e_4 = _c.sent();
                console.log(e_4);
                res.status(500).send(e_4);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get the user profile of the user with the specified id
router.get("/users/:id", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var profileQuery, user;
    return __generator(this, function (_a) {
        try {
            profileQuery = profile_1.default.findOne({ userId: req.params.id });
            user = user_1.default.findById(req.params.id);
            Promise.all([profileQuery, user]).then(function (data) { return __awaiter(void 0, void 0, void 0, function () {
                var avatar, profile;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            avatar = (_a = data[1].avatar) === null || _a === void 0 ? void 0 : _a.toString("base64");
                            return [4 /*yield*/, data[0].populate("userId", "username").execPopulate()];
                        case 1:
                            profile = _b.sent();
                            res.render("profile", __assign({ profile: profile,
                                avatar: avatar }, routerOptions_1.getRouterOptions(req, "Profile - " + req.session.user.username)));
                            return [2 /*return*/];
                    }
                });
            }); });
        }
        catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
        return [2 /*return*/];
    });
}); });
// Delete the specified user
router.delete("/users", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, user_1.default.findByIdAndDelete(req.session.user._id)];
            case 1:
                user = _a.sent();
                req.session.destroy(function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
                res.send(user);
                return [3 /*break*/, 3];
            case 2:
                e_5 = _a.sent();
                res.status(500).send(e_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
//# sourceMappingURL=user.js.map