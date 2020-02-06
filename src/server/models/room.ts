import brcrypt from "bcryptjs";
import mongoose, { Document, Model, Schema } from "mongoose";
import validator from "validator";
import User, { IUser } from "./user";

// Define the room document
interface IRoomDocument extends Document {
    name: string;
    password: string;
    capacity: number;
    owner: { type: Schema.Types.ObjectId, ref: "User" };
    users: Array<{ type: Schema.Types.ObjectId, ref: "User" }>;
}

// Define Room methods
export interface IRoom extends IRoomDocument {
    toJSON(): IRoom;
}

// Define Room statics
export interface IRoomModel extends Model<IRoom> {
    findByRoomName(name: string): IRoom;
    addUserToRoom(roomId: string | mongoose.Types.ObjectId, user: IUser): Promise<IRoom>;
    removeUserFromRoom(roomId: string | mongoose.Types.ObjectId, user: IUser): Promise<IRoom>;
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
    users: [{
        ref: User,
        type: Schema.Types.ObjectId,
    }],
}, {
    timestamps: true,
});

roomSchema.methods.toJSON = function() {
    const room = this.toObject();
    delete room.password;
    return room;
};

roomSchema.statics.addUserToRoom = async (roomId: string | mongoose.Types.ObjectId, user: IUser) => {
    return Room.findByIdAndUpdate(roomId, {
        $push: { users: user._id },
    }, {
        new: true,
    }).exec();
};

roomSchema.statics.removeUserFromRoom = async (roomId: string | mongoose.Types.ObjectId, user: IUser) => {
    return Room.findByIdAndUpdate(roomId, {
        $pull: { users: user._id },
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

roomSchema.pre("save", async function(this: IRoomDocument, next) {
    // Hash the password
    if (this.isModified("password")) {
        this.password = await brcrypt.hash(this.password, 8);
    }

    next();
});

const Room = mongoose.model<IRoom, IRoomModel>("Room", roomSchema);

export default Room;
