import express, {Request, Response} from "express";
import auth from "../middleware/auth";

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
router.get("/chat", auth, (req: Request, res: Response) => {
    res.render("chat", {
        page: "chat",
        pageTitle: websiteTitle,
        websiteAuthor,
        websiteTitle,
    });
});

// Login to an existing account
router.get("/login", (req: Request, res: Response) => {
    res.render("login", {
        page: "login",
        pageTitle: `Login - ${websiteTitle}` ,
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
