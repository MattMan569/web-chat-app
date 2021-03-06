import bcrypt from "bcryptjs";
import Cryptr from "cryptr";
import mongoose, { Document, Model } from "mongoose";
import validator from "validator";

// Define the user document
export interface IUserDocument extends Document {
    email: string;
    password: string;
    username: string;
    avatar: Buffer;
}

// Define User methods
export interface IUser extends IUserDocument {
    toJSON(): IUser;
}

// Define User statics
interface IUserModel extends Model<IUser> {
    findByUsernameAndPassword(username: string, password: string): IUser;
    findByUsername(username: string): IUser;
}

const loginError = new Error("Unable to login");

// Setup the User schema
const userSchema = new mongoose.Schema({
    email: {
        lowercase: true,
        required: true,
        trim: true,
        type: String,
        unique: true,
        validate(value: any): any {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid");
            }
        },
    },
    password: {
        minlength: 7,
        required: true,
        trim: true,
        type: String,
    },
    username: {
        maxlength: 32,
        minlength: 3,
        required: true,
        trim: true,
        type: String,
        unique: true,
    },
    avatar: {
        type: Buffer,
    },
}, {
    timestamps: true,
});

// Remove all private data from the user before sending to the client
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;

    return user;
};

// Find a user by username and password
userSchema.statics.findByUsernameAndPassword = async (username: string, password: string) => {
    const user = await User.findOne({ username });

    if (!user) {
        return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return null;
    }

    return user;
};

userSchema.statics.findByUsername = async (username: string) => {
    const user = await User.findOne({ username });

    if (!user) {
        return null;
    }

    return user;
};

// Hash the password and email before saving
userSchema.pre("save", async function(this: IUserDocument, next) {
    // Hash the password with bcrypt
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }

    // Encrypt the email with AES and store convert it to a utf-8 string
    // so it may be decrypted for use later
    if (this.isModified("email")) {
        this.email = new Cryptr(process.env.AES_SECRET).encrypt(this.email);
    }

    next();
});

const User = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;
