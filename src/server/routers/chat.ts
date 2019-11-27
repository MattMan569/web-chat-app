import express, {Request, Response} from "express";
import User from "../models/user";

const router = express.Router();

const websiteTitle = "Chat App";
const websiteAuthor = "Matthew Polsom";

// TODO: update for heroku
router.use((req: Request, res: Response, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/*
    Page requests
*/

// Room browser / home page
router.get("/", (req: Request, res: Response) => {
    res.render("index", {
        pageTitle: websiteTitle,
        websiteAuthor,
        websiteTitle,
    });
});

// Inside a chat room
router.get("/chat", (req: Request, res: Response) => {
    res.render("chat", {
        pageTitle: websiteTitle,
        websiteAuthor,
        websiteTitle,
    });
});

// Login to an existing account
router.get("/login", (req: Request, res: Response) => {
    res.render("login", {
        pageTitle: `Login - ${websiteTitle}` ,
        websiteAuthor,
        websiteTitle,
    });
});

// Sign up for an account
router.get("/signup", (req: Request, res: Response) => {
    res.render("signup", {
        pageTitle: `Signup - ${websiteTitle}`,
        websiteAuthor,
        websiteTitle,
    });
});

/*
    API requests
*/

// Create a new user
router.post("/users", async (req: Request, res: Response) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    } catch (e) {
        res.status(400).send(e);
    }
});

export default router;
