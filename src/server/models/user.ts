import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose, { Document, Model } from "mongoose";
import validator from "validator";

// Define the array of json web tokens
interface IToken {
    _id: mongoose.Types.ObjectId;
    token: string;
}

// Define the user document
interface IUserDocument extends Document {
    email: string;
    password: string;
    tokens: mongoose.Types.Array<IToken>;
    username: string;
}

// Define User methods
interface IUser extends IUserDocument {
    toJSON(): IUserDocument;
    generateAuthToken(): IToken;
}

// Define User statics
interface IUserModel extends Model<IUser> {
    findByEmailAndPassword(email: string, password: string): IUserDocument;
    findByUsernameAndPassword(username: string, password: string): IUserDocument;
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
    tokens: [{
        token: {
            required: true,
            type: String,
        },
    }],
    username: {
        maxlength: 32,
        minlength: 3,
        required: true,
        trim: true,
        type: String,
        unique: true,
    },
}, {
    timestamps: true,
});

// Remove all private data from the user before sending to the client
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.tokens;

    return user;
};

// Generate a json web token
userSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET);

    this.tokens = this.tokens.concat({ token });
    await this.save();

    return token;
};

// Find a user by email and password
userSchema.statics.findByEmailAndPassword = async (email: string, password: string) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw loginError;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw loginError;
    }

    return user;
};

// Find a user by username and password
userSchema.statics.findByUsernameAndPassword = async (username: string, password: string) => {
    const user = await User.findOne({ username });

    if (!user) {
        throw loginError;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw loginError;
    }

    return user;
};

const User = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;
