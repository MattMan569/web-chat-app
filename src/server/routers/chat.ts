import express, {Request, Response} from "express";

const router = express.Router();

const websiteTitle = "Chat App";
const websiteAuthor = "Matthew Polsom";

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

export default router;
