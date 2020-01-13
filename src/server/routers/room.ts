import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import Room, { IRoom } from "../models/room";

const router = express.Router();

// Create a room
// router.post("/rooms/create", async (req: Request, res: Response) => {

// });
