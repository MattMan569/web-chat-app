import express from "express";
import { Request, Response } from "express";
import hbs from "hbs";
import path from "path";
import { Result } from "range-parser";

const websiteTitle = "Chat App";
const websiteAuthor = "Matthew Polsom";

const app = express();
const port = process.env.PORT || 3000;

// Define paths
const publicDirectoryPath = path.join(__dirname, "./../client");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

// Setup hbs
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

// Set the static directory
app.use(express.static(publicDirectoryPath));

// Login / signup
app.get("/", (req: Request, res: Response) => {
    res.render("index", {
        websiteAuthor,
        websiteTitle,
    });
});

// Select a chat room to join
app.get("/join", (req: Request, res: Response) => {
    res.render("join", {
        websiteAuthor,
        websiteTitle,
    });
});

// In a chat room
app.get("/chat", (req: Request, res: Response) => {
    res.render("chat", {
        pageTitle: "Chat",
        websiteAuthor,
        websiteTitle,
    });
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});

export { partialsPath };
