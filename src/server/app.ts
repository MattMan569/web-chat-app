import connectMongo from "connect-mongo";
import cors from "cors";
import express, { Request, Response } from "express";
import session from "express-session";
import hbs from "hbs";
import mongoose from "mongoose";
import path from "path";
import uuidv4 from "uuid/v4";
require("./db/mongoose");
import chatRouter from "./routers/chat";
import roomRouter from "./routers/room";
import userRouter from "./routers/user";

// Define paths
const publicDirectoryPath = path.join(__dirname, "../client");
const viewsPath = path.join(__dirname, "./templates/views");
const partialsPath = path.join(__dirname, "./templates/partials");

// Create the express application
const app = express();

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
const MongoStore = connectMongo(session);
app.use(session({
    cookie: {
        maxAge: 604800000, // 1 week
    },
    genid: (req) => uuidv4(),
    resave: false,
    saveUninitialized: false, // Only create sessions on successful login
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        autoRemove: "interval",
        autoRemoveInterval: 10,
        mongooseConnection: mongoose.connection,
    }),
    unset: "destroy",
}));

// Setup hbs
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

// Set the static directory
app.use(express.static(publicDirectoryPath));

// Setup routers
app.use(chatRouter);
app.use(userRouter);
app.use(roomRouter);

// TODO move to single file for all routers
const websiteTitle = "Chat App";
const websiteAuthor = "Matthew Polsom";

// Global 404
app.get("*", (req: Request, res: Response) => {
    res.render("notFound", {
        pageTitle: "404 - Not Found",
        websiteAuthor,
        websiteTitle,
    });
});

export default app;
