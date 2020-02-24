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
    // TODO check if users is init is needed
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

            // Authorize the creator for the new room
            req.session.authorizedRooms.push(room._id);

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

// Authorize the user for the specified room
router.post("/rooms/join/:id", auth, async (req: Request, res: Response) => {
    const roomId = req.params.id;
    const password = req.body.password;

    // User was already authorized
    // TODO consider removing, auth then remove on join
    // so password must always be entered
    if (req.session.authorizedRooms.includes(roomId)) {
        return res.send();
    }

    const room = await Room.findById(roomId);

    // Check the provided password against the room's password
    if (room.comparePassword(password)) {
        // Authorize the user to enter the room
        req.session.authorizedRooms.push(roomId);

        // Must save to prevent race conditions with roomAuth
        req.session.save((err) => {
            if (err) {
                return res.status(500).send(err);
            }

            return res.send();
        });
    } else {
        // Password mismatch
        res.status(401).send();
    }
});

// Deauthorize the user for the specified room
router.post("/rooms/leave/:id", auth, async (req: Request, res: Response) => {
    // TODO
    // deuathorize on kick or leave
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
