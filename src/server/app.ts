import express from "express";
import hbs from "hbs";
import path from "path";
require("./db/mongoose");
import chatRouter from "./routers/chat";

// Define paths
const publicDirectoryPath = path.join(__dirname, "../client");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

const app = express();

// Setup hbs
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

// Set the static directory
app.use(express.static(publicDirectoryPath));

app.use(chatRouter);

export default app;
