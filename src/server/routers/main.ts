import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import Room from "../models/room";
import { getRouterOptions, websiteInfo } from "./util/routerOptions";

const router = express.Router();

const websiteTitle = "Chat App";
const websiteAuthor = "Matthew Polsom";

// Room browser / home page
router.get("/", auth, (req: Request, res: Response) => {
    res.render("index", {
        ...getRouterOptions(req, websiteInfo.websiteTitle),
    });
});

// Inside a chat room
router.get("/chat", auth, async (req: Request, res: Response) => {
    res.render("chat", {
        ...getRouterOptions(req, `Chat - ${websiteInfo.websiteTitle}`),
    });
});

// Log in to an existing account
router.get("/login", (req: Request, res: Response) => {
    if (req.session.loggedIn) {
        res.redirect("/");
        return;
    }

    const invalid = (req.query.valid === "false");

    // TODO replace "invalid" with ajax result
    res.render("login", {
        ...getRouterOptions(req, `Login - ${websiteInfo.websiteTitle}`),
    });
});

// Sign up for an account
router.get("/signup", (req: Request, res: Response) => {
    if (req.session.loggedIn) {
        res.redirect("/");
        return;
    }

    res.render("signup", {
        ...getRouterOptions(req, `Sign Up - ${websiteInfo.websiteTitle}`),
    });
});

export default router;
