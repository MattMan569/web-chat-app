import express, { NextFunction, Request, Response } from "express";
import fs from "fs";
import multer from "multer";
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
                // TODO reject or generate error?
                callback(undefined, false);
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
    // delete userObj.avatar;

    // Convert the binary buffer to a usable base64 string for <img/> src
    userObj.avatar = `data:image/png;base64,${Buffer.from(user.avatar).toString("base64")}`;
    session.authorizedRooms = [];
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

        // HACK fix typings to allow string on user.avatar
        const sessionUser = req.session.user as any;
        sessionUser.avatar = `data:image/png;base64,${Buffer.from(user.avatar).toString("base64")}`;
        req.session.user.avatar = sessionUser.avatar;

        res.send(`data:image/png;base64,${Buffer.from(user.avatar).toString("base64")}`);
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
}, (error: multer.MulterError, req: Request, res: Response, next: NextFunction) => {
    console.log(error);
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

// Get the user profile of the user with the specified id
router.get("/users/:id", auth, async (req: Request, res: Response) => {
    const profile = await Profile.findOne({ userId: req.params.id });

    res.render("profile", {
        profile,
        ...getRouterOptions(req, `Profile - ${req.session.user.username}`),
    });
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

/*

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

*/

export default router;
