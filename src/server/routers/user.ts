import express, { NextFunction, Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import auth from "../middleware/auth";
import Profile from "../models/profile";
import User, { IUser } from "../models/user";
import { getRouterOptions } from "./util/routerOptions";

const router = express.Router();

const upload = multer({
    limits: {
        fileSize: 1048576, // 1 MiB
    },
    fileFilter(req, file, callback) {
        try {
            // Images only
            if (!file.originalname.match(/\.(tiff?|pjp(eg)?|jfif|tif|gif|svgz?|bmp|png|jpe?g?|webp|ico|xbm|dib|ai|drw|pct|psp|xcf|psd|raw)$/i)) {
                callback(new Error("Incorrect file format"));
            }

            callback(undefined, true);
        } catch (e) {
            callback(e);
        }
    },
});

// Setup the session
const createSession = (session: Express.Session, user: IUser) => {
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.avatar;

    session.authorizedRooms = [];
    session.user = userObj;
    session.loggedIn = true;
};

// Create a new user and log in
router.post("/users", async (req: Request, res: Response) => {
    try {
        const avatar = fs.readFileSync(path.join(__dirname, "../img/defaultAvatar.png"));
        const userData = {
            ...req.body,
            avatar,
        };

        const user = await User.create(userData);

        Profile.create({
            userId: user._id,
            description: "Edit me!",
            online: true,
        });

        createSession(req.session, user);
        res.send("/");
    } catch (e) {
        if (e.name === "ValidationError") {
            res.status(400).send("Password must be at least 7 characters long");
        } else if (e.name === "MongoError") {
            res.status(400).send("Username is already taken");
        } else {
            console.log(e);
            res.status(500).send("Internal server error");
        }
    }
});

// Upload a profile picture
router.post("/users/upload/avatar", [auth, upload.single("avatar")], async (req: Request, res: Response) => {
    try {
        // Convert the image to a 250px X 250px PNG
        const image = await sharp(req.file.buffer).png().resize(250, 250).toBuffer();

        const user = await User.findByIdAndUpdate(req.session.user._id, {
            avatar: image,
        }, {
            new: true,
        });

        res.send(`data:image/png;base64,${Buffer.from(user.avatar).toString("base64")}`);
    } catch (e) {
        console.trace(e);
        res.status(500).send(e);
    }
}, (error: multer.MulterError, req: Request, res: Response, next: NextFunction) => {
    res.status(400).send({
        error: error.message,
    });
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
        console.log(e);
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
        console.log(e);
        res.status(500).send(e);
    }
});

// Get the information of the user making the request
router.get("/users/me", auth, async (req: Request, res: Response) => {
    try {
        res.send(await User.findById(req.session.user._id));
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});

// Get the user profile of the user with the specified id
router.get("/users/:id", auth, async (req: Request, res: Response) => {
    try {
        const profileQuery = Profile.findOne({ userId: req.params.id });
        const user = User.findById(req.params.id);

        Promise.all([profileQuery, user]).then(async (data) => {
            const avatar = data[1].avatar?.toString("base64");
            const profile = await data[0].populate("userId", "username").execPopulate();

            res.render("profile", {
                profile,
                avatar,
                ...getRouterOptions(req, `Profile - ${req.session.user.username}`),
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

// Delete the specified user
router.delete("/users", auth, async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.session.user._id);
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
            }
        });
        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
});

export default router;
