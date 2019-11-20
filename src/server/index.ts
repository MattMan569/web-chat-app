import express from "express";
import { Request, Response } from "express";
import hbs from "hbs";
import path from "path";

const websiteTitle = "Chat App";
const websiteAuthor = "Matthew Polsom";

const app = express();
const port = process.env.PORT || 3000;

// Define paths
const publicDirectoryPath = path.join(__dirname, "./../client");
const viewsPath = path.join(__dirname, "../client/templates/views");
const partialsPath = path.join(__dirname, "../client/templates/partials");

// Setup hbs
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

// Set the static directory
app.use(express.static(publicDirectoryPath));

app.get("/", (req: Request, res: Response) => {
    res.render("index", {
        websiteAuthor,
        websiteTitle,
    });
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
