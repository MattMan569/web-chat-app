import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import User, { IUser } from "../models/user";

const router = express.Router();

// Create a new user and log in
router.post("/users", async (req: Request, res: Response) => {
    const user = new User(req.body);

    try {
        await user.save();
        req.session.user = user;
        req.session.loggedIn = true;
        res.redirect("/");
    } catch (e) {
        res.status(400).send(e);
    }
});

// Log in as an existing user
router.post("/users/login", async (req: Request, res: Response) => {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    let user: IUser;

    try {
        if (req.body.email) {
            user = await User.findByEmailAndPassword(email, password);
        } else if (req.body.username) {
            user = await User.findByUsernameAndPassword(username, password);
        } else {
            return res.status(400).send("Must provide username or email");
        }

        // User not found with provided credentials
        if (!user) {
            return res.redirect("/login?valid=false");
        }

        req.session.user = user;
        req.session.loggedIn = true;
        console.log(req.session);
        res.redirect("/");
    } catch (e) {
        return res.status(400).send(e);
    }
});

// Log out
router.get("/users/logout", auth, async (req: Request, res: Response) => {
    try {
        req.session.destroy((e) => {
            throw new Error(e);
        });
        res.redirect("/login");
    } catch (e) {
        res.status(500).send(e);
    }
});

// Log out everywhere
router.post("/users/logoutAll", auth, async (req: Request, res: Response) => {
    try {
        // TODO
    } catch (e) {
        res.status(500).send();
    }
});

// Get the user object making the request
router.get("/users/me", auth, async (req: Request, res: Response) => {
    res.send(req.body.user);
});

export default router;
