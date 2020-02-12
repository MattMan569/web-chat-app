import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import Room, { IRoom } from "../models/room";
import User from "./../models/user";
import { getRouterOptions, websiteInfo } from "./util/routerOptions";

const router = express.Router();

// Create a room
router.post("/rooms/create", auth, async (req: Request, res: Response) => {
    const user = await User.findByUsername(req.session.user.username);

    // The current user is the room's owner and first user
    req.body.owner = user._id;
    req.body.users = [];

    try {
        await new Room(req.body).save((e, room) => {
            if (e) {
                console.log(e);
                // TODO parse 'e' and send helpful error message
                res.status(400).send("Error");
                return;
            }

            // Send the URL to redirect to
            res.send(`/chat?room=${room._id}`);
        });

    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

// Get all rooms
router.get("/rooms", auth, async (req: Request, res: Response) => {
    res.send(await Room.find());
});

// Get a specific room
router.get("/rooms/:id", auth, async (req: Request, res: Response) => {
    res.send(Room.findById(req.params.id).exec());
});

// Show the room's cofiguration page
router.get("/rooms/config/:id", auth, async (req: Request, res: Response) => {
    const room = await Room.findById(req.params.id);
    res.render("config", {
        ...getRouterOptions(req, `Configure - ${websiteInfo.websiteTitle}`),
        room,
    });
});

export default router;
