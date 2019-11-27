import express, { Request, Response } from "express";
import User, { IUser } from "../models/user";

const router = express.Router();

// TODO: update for heroku
router.use((req: Request, res: Response, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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

export default router;
