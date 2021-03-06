import brcrypt from "bcryptjs";
import Cryptr from "cryptr";
import mongoose, { Document, Model, Schema } from "mongoose";
import validator from "validator";
import User, { IUser } from "./user";

// Define the room document
interface IRoomDocument extends Document {
    name: string;
    password: string;
    locked: boolean; // true if password is non-empty
    capacity: number;
    owner: { type: Schema.Types.ObjectId, ref: "User" };
    users: Array<{
        socketId: string,
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    }>;
    bannedUsers: Array<{
            type: Schema.Types.ObjectId,
            ref: "User",
    }>;
}

// Define Room methods
export interface IRoom extends IRoomDocument {
    comparePassword(password: string): boolean;
    toJSON(): IRoom;
}

// Define Room statics
export interface IRoomModel extends Model<IRoom> {
    findByRoomName(name: string): IRoom;
    addUserToRoom(roomId: string | mongoose.Types.ObjectId, user: IUser, socketId: string): Promise<IRoom>;
    removeUserFromRoom(roomId: string | mongoose.Types.ObjectId, user: IUser): Promise<IRoom>;
    banUser(roomId: string, user: IUser): Promise<IRoom>;
    unbanUser(roomId: string, user: IUser): Promise<IRoom>;
}

const roomSchema = new mongoose.Schema({
    capacity: {
        max: 100,
        min: 1,
        required: true,
        type: Number,
    },
    name: {
        maxlength: 50,
        required: true,
        trim: true,
        type: String,
        unique: true,
    },
    owner: {
        ref: User,
        required: true,
        type: Schema.Types.ObjectId,
    },
    password: {
        trim: true,
        type: String,
    },
    locked: {
        type: Boolean,
    },
    users: [{
        socketId: String,
        user: {
            ref: User,
            type: Schema.Types.ObjectId,
        },
    }],
    bannedUsers: [{
        ref: User,
        type: Schema.Types.ObjectId,
    }],
}, {
    timestamps: true,
});

roomSchema.methods.comparePassword = function(this: IRoom, password: string) {
    const roomPassword = new Cryptr(process.env.AES_SECRET).decrypt(this.password);
    return roomPassword === password;
};

roomSchema.methods.toJSON = function(this: IRoom) {
    const room = this.toObject();
    delete room.password;
    return room;
};

roomSchema.statics.addUserToRoom = async (roomId: string | mongoose.Types.ObjectId, user: IUser, socketId: string) => {
    const userObj = {
        socketId,
        user: user._id,
    };

    return Room.findByIdAndUpdate(roomId, {
        $push: { users: userObj },
    }, {
        new: true,
    }).exec();
};

roomSchema.statics.removeUserFromRoom = async (roomId: string | mongoose.Types.ObjectId, user: IUser) => {
    return Room.findByIdAndUpdate(roomId, {
        $pull: { users: { user: user._id } },
    }, {
        new: true,
    }).exec();
};

roomSchema.statics.findByRoomName = async (name: string) => {
    const room = await Room.findOne({ name });

    if (!room) {
        return null;
    }

    return room;
};

// Add the user to the room's banned user list
roomSchema.statics.banUser = async (roomId: string, user: IUser) => {
    return Room.findByIdAndUpdate(roomId, {
        $addToSet: {
            bannedUsers: user._id,
        },
    }, {
        new: true,
    }).exec();
};

// Remove the user from the room's banned user list
roomSchema.statics.unbanUser = async (roomId: string, user: IUser) => {
    return Room.findByIdAndUpdate(roomId, {
        $pull: { bannedUsers: user._id },
    }, {
        new: true,
    }).exec();
};

roomSchema.pre("save", async function(this: IRoomDocument, next) {
    // Encrypt the password
    if (this.isModified("password")) {
        this.locked = this.password !== "";
        this.password = new Cryptr(process.env.AES_SECRET).encrypt(this.password);
    }

    next();
});

const Room = mongoose.model<IRoom, IRoomModel>("Room", roomSchema);

export default Room;
