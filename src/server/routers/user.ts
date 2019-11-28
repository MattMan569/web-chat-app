import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import User, { IUser } from "../models/user";

const router = express.Router();

// Create a new user
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

// Login as an existing user
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
    } catch (e) {
        return res.status(400).send(e);
    }

    res.send({ user });
});

// Logout
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

// Logout everywhere
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
