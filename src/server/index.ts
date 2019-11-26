import express from "express";
import { Request, Response } from "express";
import hbs from "hbs";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

// Define paths
const publicDirectoryPath = path.join(__dirname, "../client");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

const websiteTitle = "Chat App";
const websiteAuthor = "Matthew Polsom";

// Setup hbs
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

// Set the static directory
app.use(express.static(publicDirectoryPath));

// Room browser / home page
app.get("/", (req: Request, res: Response) => {
    res.render("index", {
        pageTitle: websiteTitle,
        websiteAuthor,
        websiteTitle,
    });
});

// Inside a chat room
app.get("/chat", (req: Request, res: Response) => {
    res.render("chat", {
        pageTitle: websiteTitle,
        websiteAuthor,
        websiteTitle,
    });
});

// Login to an existing account
app.get("/login", (req: Request, res: Response) => {
    res.render("login", {
        pageTitle: `Login - ${websiteTitle}` ,
        websiteAuthor,
        websiteTitle,
    });
});

// Sign up for an account
app.get("/signup", (req: Request, res: Response) => {
    res.render("signup", {
        pageTitle: `Signup - ${websiteTitle}`,
        websiteAuthor,
        websiteTitle,
    });
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
