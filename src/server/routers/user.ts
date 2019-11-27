import express, { Request, Response } from "express";
import User, { IToken, IUser } from "../models/user";

const router = express.Router();

// Create a new user
router.post("/users", async (req: Request, res: Response) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
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

    const token = user.generateAuthToken();
    res.send({ user, token });
});

// Logout
router.post("/users/logout", async (req: Request, res: Response) => {
    try {
        // Remove the token the user is currently logged in with
        req.body.user.tokens = req.body.user.tokens.filter((token: IToken) => {
            return token.token !== req.body.token;
        });
        await req.body.user.save();

        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
});

// Logout everywhere
router.post("/users/logoutAll", async (req: Request, res: Response) => {
    try {
        // Remove all tokens from the user
        req.body.user.tokens = [];
        await req.body.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// Get the user object making the request
router.get("/users/me", async (req: Request, res: Response) => {
    res.send(req.body.user);
});

export default router;
