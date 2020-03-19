"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var connect_mongo_1 = __importDefault(require("connect-mongo"));
var cors_1 = __importDefault(require("cors"));
var cryptr_1 = __importDefault(require("cryptr"));
var express_1 = __importDefault(require("express"));
var express_session_1 = __importDefault(require("express-session"));
var hbs_1 = __importDefault(require("hbs"));
var http_1 = __importDefault(require("http"));
var mongoose_1 = __importDefault(require("mongoose"));
var path_1 = __importDefault(require("path"));
var v4_1 = __importDefault(require("uuid/v4"));
require("./db/mongoose");
var main_1 = __importDefault(require("./routers/main"));
var profile_1 = __importDefault(require("./routers/profile"));
var room_1 = __importDefault(require("./routers/room"));
var user_1 = __importDefault(require("./routers/user"));
// Define paths
var publicDirectoryPath = path_1.default.join(__dirname, "../client");
var viewsPath = path_1.default.join(__dirname, "./templates/views");
var partialsPath = path_1.default.join(__dirname, "./templates/partials");
// Create the express application and server
var app = express_1.default();
var server = http_1.default.createServer(app);
// Use CORS
app.use(cors_1.default({
    credentials: true,
    origin: true,
}));
// Automatically parse json
app.use(express_1.default.json());
// Process HTML POST requests
app.use(express_1.default.urlencoded({
    extended: false,
}));
// Setup session management
var MongoStore = connect_mongo_1.default(express_session_1.default);
exports.store = new MongoStore({
    autoRemove: "interval",
    autoRemoveInterval: 10,
    mongooseConnection: mongoose_1.default.connection,
});
exports.session = express_session_1.default({
    cookie: {
        maxAge: 604800000,
    },
    genid: function (req) { return v4_1.default(); },
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    store: exports.store,
    unset: "destroy",
});
app.use(exports.session);
// Setup hbs
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs_1.default.registerPartials(partialsPath);
hbs_1.default.registerHelper("ifeq", function (a, b, options) {
    // tslint:disable-next-line: triple-equals
    if (a == b) {
        return options.fn(this);
    }
    return options.inverse(this);
});
hbs_1.default.registerHelper("ifnoteq", function (a, b, options) {
    // tslint:disable-next-line: triple-equals
    if (a != b) {
        return options.fn(this);
    }
    return options.inverse(this);
});
hbs_1.default.registerHelper("decrypt", function (password) {
    return new cryptr_1.default(process.env.AES_SECRET).decrypt(password);
});
// Set the static directory
app.use(express_1.default.static(publicDirectoryPath));
// Setup routers
app.use(main_1.default);
app.use(profile_1.default);
app.use(room_1.default);
app.use(user_1.default);
// Redirect home on 404
app.get("*", function (req, res) {
    res.redirect("/");
});
exports.default = server;
//# sourceMappingURL=server.js.map