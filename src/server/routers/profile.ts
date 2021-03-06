import express, { Request, Response } from "express";
import auth from "./../middleware/auth";
import Profile from "./../models/profile";

const router = express.Router();

// Edit profile description
router.patch("/profiles/description", auth, async (req: Request, res: Response) => {
    try {
        const profile = await Profile.findOneAndUpdate({
            // Users can only update their own profiles
            userId: req.session.user._id,
        }, {
            description: req.body.description,
        }, {
            new: true,
        });

        // Send back the updated profile
        res.send(profile);
    } catch (e) {
        res.status(500).send();
    }
});

export default router;
