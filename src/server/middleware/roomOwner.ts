import { NextFunction, Request, Response } from "express";
import Room from "../models/room";

// Check if the user is the owner of the current room
const roomOwner = async (req: Request, res: Response, next: NextFunction) => {
    const roomId = req.params.id;
    const room = await Room.findById(roomId);

    // Session stores string, model stores ObjectID
    // tslint:disable-next-line: triple-equals
    if (req.session.user._id == room.owner) {
        next();
    } else {
        res.status(401).redirect("/");
    }
};

export default roomOwner;
