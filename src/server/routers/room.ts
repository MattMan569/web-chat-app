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
        const room = new Room(req.body);

        // Create and automatically join the room
        await room.save((e, p) => {
            if (e) {
                console.log(e);
                // TODO parse 'e' and send helpful error message
                res.status(400).send("Error");
                return;
            }

            // Send the URL to redirect to
            res.send(`/chat?room=${p.id}`);
        });
    } catch (e) {
        res.status(400).send(e);
    }
});

export default router;
