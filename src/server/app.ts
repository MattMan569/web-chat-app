import connectMongo from "connect-mongo";
import cors from "cors";
import express from "express";
import session from "express-session";
import hbs from "hbs";
import mongoose from "mongoose";
import path from "path";
import uuidv4 from "uuid/v4";
require("./db/mongoose");
import chatRouter from "./routers/chat";
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
    genid: (req) => uuidv4(),
    resave: false,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
    }),
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

// TODO
// Global 404
// app.get("*", (req: Request, res: Response) => {
//
// });

export default app;
