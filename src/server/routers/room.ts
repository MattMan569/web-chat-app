import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import Room, { IRoom } from "../models/room";
import User from "./../models/user";

const router = express.Router();

// Create a room
router.post("/rooms/create", async (req: Request, res: Response) => {
    const user = await User.findByUsername(req.session.user.username);

    // The current user is the room's owner and first user
    req.body.owner = user._id;
    req.body.users = [user._id];

    try {
        const room = await new Room(req.body).save((e) => {
            if (e) {
                console.log(e);
                // TODO parse 'e' and send helpful error message
                res.status(400).send("Error");
                return;
            }
        });

        // Send the URL to redirect to
        res.send(`/chat?room=${room.id}`);
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

// Get all rooms
router.get("/rooms", async (req: Request, res: Response) => {
    res.send(await Room.find());
});

export default router;
