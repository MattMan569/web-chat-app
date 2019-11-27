import cors from "cors";
import express from "express";
import hbs from "hbs";
import path from "path";
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
app.use(cors({
    credentials: true,
    origin: true,
}));

// Setup hbs
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

// Automatically parse json
app.use(express.json());

// Set the static directory
app.use(express.static(publicDirectoryPath));

// Setup routers
app.use(chatRouter);
app.use(userRouter);

export default app;
