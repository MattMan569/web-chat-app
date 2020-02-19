import { NextFunction, Request, Response } from "express";

// Check if the user is authorized for the current room
const roomAuth = async (req: Request, res: Response, next: NextFunction) => {
    const roomId = req.url.split("=")[1];
    if (req.session.authorizedRooms.includes(roomId)) {
        next();
    } else {
        res.status(401).redirect("/");
    }
};

export default roomAuth;
