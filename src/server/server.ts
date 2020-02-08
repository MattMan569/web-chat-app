import connectMongo from "connect-mongo";
import cors from "cors";
import express, { Request, Response } from "express";
import expressSession from "express-session";
import hbs from "hbs";
import http from "http";
import mongoose from "mongoose";
import path from "path";
import uuidv4 from "uuid/v4";
require("./db/mongoose");
import mainRouter from "./routers/main";
import profileRouter from "./routers/profile";
import roomRouter from "./routers/room";
import userRouter from "./routers/user";

// Define paths
const publicDirectoryPath = path.join(__dirname, "../client");
const viewsPath = path.join(__dirname, "./templates/views");
const partialsPath = path.join(__dirname, "./templates/partials");

// Create the express application and server
const app = express();
const server = http.createServer(app);

// Use CORS
// TODO: check if needed
app.use(cors({
    credentials: true,
    origin: true,
}));

// Automatically parse json
app.use(express.json());

// Process HTML POST requests
app.use(express.urlencoded({
    extended: false,
}));

// Setup session management
const MongoStore = connectMongo(expressSession);
export const store = new MongoStore({
    autoRemove: "interval",
    autoRemoveInterval: 10,
    mongooseConnection: mongoose.connection,
});
export const session = expressSession({
    cookie: {
        maxAge: 604800000, // 7 days
    },
    genid: (req) => uuidv4(),
    resave: false,
    saveUninitialized: false, // Only create sessions on successful login
    secret: process.env.SESSION_SECRET,
    store,
    unset: "destroy",
});
app.use(session);

// Setup hbs
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

hbs.registerHelper("ifeq", function(this: any, a, b, options) {
    // tslint:disable-next-line: triple-equals
    if (a == b) {
        return options.fn(this);
    }
    return options.inverse(this);
});

hbs.registerHelper("ifnoteq", function(this: any, a, b, options) {
    // tslint:disable-next-line: triple-equals
    if (a != b) {
        return options.fn(this);
    }
    return options.inverse(this);
});

// Set the static directory
app.use(express.static(publicDirectoryPath));

// Setup routers
app.use(mainRouter);
app.use(profileRouter);
app.use(roomRouter);
app.use(userRouter);

// TODO move to single file for all routers
const websiteTitle = "Chat App";
const websiteAuthor = "Matthew Polsom";

// Redirect home on 404
app.get("*", (req: Request, res: Response) => {
    res.redirect("/");
});

export default server;
