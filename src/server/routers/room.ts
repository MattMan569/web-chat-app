import Cryptr from "cryptr";
import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import roomOwner from "../middleware/roomOwner";
import Room, { IRoom } from "../models/room";
import User from "./../models/user";
import { getRouterOptions, websiteInfo } from "./util/routerOptions";

const router = express.Router();

// Create a room
router.post("/rooms/create", auth, async (req: Request, res: Response) => {
    const user = await User.findByUsername(req.session.user.username);

    // The current user is the room's owner
    req.body.owner = user._id;

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

// Ban the specified user
router.post("/rooms/ban", auth, async (req: Request, res: Response) => {
    try {
        const roomId = req.body.roomId;
        const username = req.body.username;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).send("Invalid username");
        }

        res.send(await Room.banUser(roomId, user));
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});

// Unban the specified user
router.post("/rooms/unban", auth, async (req: Request, res: Response) => {
    try {
        const roomId = req.body.roomId;
        const userId = req.body.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).send("Invalid user ID");
        }

        res.send(await Room.unbanUser(roomId, user));
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});

// Authorize the user for the specified room
router.post("/rooms/join/:id", auth, async (req: Request, res: Response) => {
    try {
        const roomId = req.params.id;
        const password = req.body.password;

        // User was already authorized
        // TODO consider removing, auth then remove on join
        // so password must always be entered
        if (req.session.authorizedRooms.includes(roomId)) {
            return res.send();
        }

        const room = await Room.findById(roomId);

        // Room not found
        if (!room) {
            return res.status(404).redirect("/");
        }

        // Room capacity has been reached
        if (room.users.length >= room.capacity) {
            return res.status(400).send("Room is full");
        }

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
            res.status(401).send("Incorrect password");
        }
    } catch (e) {
        res.status(500).send("Internal server error");
    }
});

// Change the room's name
router.patch("/rooms/name", auth, async (req: Request, res: Response) => {
    try {
        const roomId = req.headers.referer.split("/").pop();
        let room = await Room.findById(roomId);

        // Room owner is object, user id is string
        // tslint:disable-next-line: triple-equals
        if (room.owner != req.session.user._id) {
            res.status(403).send("Only room owners may change the room's name");
            return;
        }

        room = await Room.findByIdAndUpdate(roomId, {
            name: req.body.name,
        }, {
            new: true,
        });

        Room.emit("roomUpdate", room);
        res.send(room);
    } catch (error) {
        if (error.codeName === "DuplicateKey") {
            res.status(400).send("Room name is already taken.");
            return;
        }

        console.log(error);
        res.status(500).send("Internal server error.");
    }
});

// Change the room's password
router.patch("/rooms/password", auth, async (req: Request, res: Response) => {
    try {
        const roomId = req.headers.referer.split("/").pop();
        const password = new Cryptr(process.env.AES_SECRET).encrypt(req.body.password);
        const locked = req.body.password !== "";

        const room = await Room.findByIdAndUpdate(roomId, {
            password,
            locked,
        }, {
            new: true,
        });

        res.send({
            room,
            password: req.body.password,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
});

// Change the room's capacity
router.patch("/rooms/capacity", auth, async (req: Request, res: Response) => {
    try {
        const roomId = req.headers.referer.split("/").pop();
        const capacity = req.body.capacity;

        if (capacity < 1 || capacity > 100) {
            res.status(400).send("Invalid capacity value");
            return;
        }

        const room = await Room.findByIdAndUpdate(roomId, {
            capacity: req.body.capacity,
        }, {
            new: true,
        });
        Room.emit("roomUpdate", room);
        res.send(room);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
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
router.get("/rooms/config/:id", [auth, roomOwner], async (req: Request, res: Response) => {
    const room = await (await Room.findById(req.params.id).populate("bannedUsers", "username")).execPopulate();
    res.render("config", {
        ...getRouterOptions(req, `Configure - ${websiteInfo.websiteTitle}`),
        room,
    });
});

router.delete("/rooms/:id", [auth, roomOwner], async (req: Request, res: Response) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        Room.emit("roomDelete", room);
        res.send(room);
    } catch (e) {
        console.trace(e);
        res.status(500).send(e);
    }
});

export default router;
