import mongoose, { Document, Model, Schema } from "mongoose";
import User, { IUser } from "./user";

// Define the document
interface IProfileDocument extends Document {
    userId: { type: Schema.Types.ObjectId, ref: "User" };
    description: string;
    friends: Array<{ type: Schema.Types.ObjectId, ref: "User" }>;
    online: boolean;
}

// Define methods
export interface IProfile extends IProfileDocument {
    addFriend(friend: IUser): void;
    removeFriend(friend: IUser): void;
    changeDescription(newDescription: string): void;
    setOnline(isOnline: boolean): void;
    // TODO toJSON remove friends list from profile if private?
}

// Define statics
export interface IProfileModel extends Model<IProfile> {
    findProfileByUserId(userId: string | mongoose.Types.ObjectId): IProfile;
}

const profileSchema = new mongoose.Schema({
    userId: {
        ref: User,
        type: Schema.Types.ObjectId,
        unique: true,
    },
    description: {
        type: String,
    },
    friends: [{
        ref: User,
        type: Schema.Types.ObjectId,
    }],
    online: {
        type: Boolean,
    },
}, {
    timestamps: true,
});

profileSchema.methods.addFriend = async function(this: IProfile, friend: IUser) {
    // Only push if unique
    if (this.friends.indexOf(friend._id) === -1) {
        this.friends.push(friend._id);
    }

    // TODO see if save is required
    this.save();
};

profileSchema.methods.removeFriend = async function(this: IProfile, friend: IUser) {
    this.friends = this.friends.filter((el) => {
        // Disable triple equals as el is a mongoose object
        // tslint:disable-next-line: triple-equals
        return el !== friend._id;
    });

    this.save();
};

profileSchema.methods.changeDescription = async function(this: IProfile, newDescription: string) {
    this.description = newDescription;
    this.save();
};

profileSchema.methods.setOnline = async function(this: IProfile, isOnline: boolean) {
    this.online = isOnline;
    this.save();
};

profileSchema.statics.findProfileByUserId = async (userId: string | mongoose.Types.ObjectId) => {
    return Profile.findOne({ userId });
};

const Profile = mongoose.model<IProfile, IProfileModel>("Profile", profileSchema);

export default Profile;
