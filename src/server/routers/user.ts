import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import Profile from "../models/profile";
import User, { IUser } from "../models/user";

const router = express.Router();

// Setup the session
const createSession = (session: Express.Session, user: IUser) => {
    const userObj = user.toObject();
    delete userObj.password;
    session.user = userObj;
    session.loggedIn = true;
};

// Create a new user and log in
router.post("/users", async (req: Request, res: Response) => {
    try {
        const user = await User.create(req.body);

        Profile.create({
            userId: user._id,
            description: "Edit me!",
            online: true,
        });

        createSession(req.session, user);
        res.redirect("/");
    } catch (e) {
        res.status(400).send(e);
    }
});

// Log in as an existing user
router.post("/users/login", async (req: Request, res: Response) => {
    const username = req.body.username;
    const password = req.body.password;
    let user: IUser;

    try {
        // Try to find user by username and password
        user = await User.findByUsernameAndPassword(username, password);

        // User not found with provided credentials
        if (!user) {
            return res.status(400).send("Your login information is invalid.");
        }

        createSession(req.session, user);
        res.send("/");
    } catch (e) {
        return res.status(500).send(e);
    }
});

// Log out
router.get("/users/logout", auth, async (req: Request, res: Response) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
                return;
            }
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
        // Save session IDs to user db
        // to list on user profile along
        // with logout-all functionality
    } catch (e) {
        res.status(500).send();
    }
});

// Get the user profile of the user with the specified id
router.get("/users/:id", auth, async (req: Request, res: Response) => {
    const profile = await Profile.findOne({ userId: req.params.id });

    res.render("profile", {
        loggedIn: req.session.loggedIn,
        page: "index",
        pageTitle: "Chat App - Profile",
        profile,
        username: req.session.user.username,
        userId: req.session.user._id,
        websiteAuthor: "Matthew Polsom",
        websiteTitle: "Chat App",
    });
});

export default router;
