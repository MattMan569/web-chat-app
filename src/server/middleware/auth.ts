import { NextFunction, Request, Response } from "express";

// Check if the session is logged in
const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.session.loggedIn) {
            next();
        } else {
            throw new Error();
        }
    } catch (e) {
        res.status(401).redirect("/login");
    }
};

export default auth;
