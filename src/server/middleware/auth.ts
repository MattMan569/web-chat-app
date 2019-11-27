import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import User, { IToken } from "../models/user";

// Check that the used token is in the list of the user's currently active tokens
const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Retrieve and verify the token
        const token = req.headers.authorization.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as IToken;
        const user = await User.findOne({"_id": decoded._id, "tokens.token": token});

        // No user exists with that token
        if (!user) {
            throw new Error();
        }

        // Add the found user and their token onto the request
        req.body.user = user;
        req.body.token = token;

        next();
    } catch (e) {
        res.status(401).send({error: "Please authenticate"});
    }
};

export default auth;
