import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import Room from "../models/room";

const router = express.Router();

const websiteTitle = "Chat App";
const websiteAuthor = "Matthew Polsom";

// Room browser / home page
router.get("/", auth, (req: Request, res: Response) => {
    res.render("index", {
        loggedIn: req.session.loggedIn,
        page: "index",
        pageTitle: websiteTitle,
        username: req.session.user.username,
        websiteAuthor,
        websiteTitle,
    });
});

// Inside a chat room
router.get("/chat", auth, async (req: Request, res: Response) => {
    const roomId = req.query.room;
    const userId = req.session.user._id;
    const userAlreadyInRoom = (await Room.find({ _id: roomId, users: userId })).length > 0;

    // TODO prevent request via ajax request on index page
    if (userAlreadyInRoom) {
        res.status(400).redirect("/");
        return;
    }

    res.render("chat", {
        loggedIn: req.session.loggedIn,
        page: "chat",
        pageTitle: websiteTitle,
        username: req.session.user.username,
        websiteAuthor,
        websiteTitle,
    });
});

// Log in to an existing account
router.get("/login", (req: Request, res: Response) => {
    const invalid = (req.query.valid === "false");

    res.render("login", {
        invalid,
        page: "login",
        pageTitle: `Login - ${websiteTitle}`,
        websiteAuthor,
        websiteTitle,
    });
});

// Sign up for an account
router.get("/signup", (req: Request, res: Response) => {
    res.render("signup", {
        page: "signup",
        pageTitle: `Signup - ${websiteTitle}`,
        websiteAuthor,
        websiteTitle,
    });
});

export default router;
