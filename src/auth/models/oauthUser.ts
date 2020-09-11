import mongoose from "mongoose";
import bcrypt from "bcrypt-nodejs";

const Schema = mongoose.Schema;

interface UserFunction{
    (password: string): boolean;
}

export enum Roles {
    User = "User",
    Staff = "Staff",
    Super = "Super"
}

export type OAuthUserDocument = mongoose.Document & {
    email: string;
    phone: number;
    password: string;
    username: string;//email name or phone number.
    openid: string;
    scope: string;
    roles: string;
    status: number;
    comparePassword: UserFunction;
};

const OAuthUserSchema = new Schema({
    email: { type: String, default: "" },
    phone: { type: Number, default: 0 },
    password: { type: String, required: true },
    username: { type: String, required: true },
    openid: { type: String, default: "" },
    scope: { type: String, default: "read" },
    roles: {
        type: String,
        enum: ["User", "Staff", "Super"],
        default: "User",
        required: "invalid role"
    },
    status: {
        type: Number,
        required: true,
        default: 0,  // 1 active, -1 block
        enum: [-1, 0, 1, 2] // -1: blocked, 0: first login, 1: common, 2: require confirm
    }
}, { timestamps: true });

/**
 * Password hash middleware.
 */
OAuthUserSchema.pre("save", function save(next) {
    const user = this as OAuthUserDocument;
    if (!user.isModified("password")) {
        return next();
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(user.password, salt);
    user.password = hash;
    next();
});

OAuthUserSchema.methods.comparePassword = function (candidatePassword: string): boolean {
    const isMatch = bcrypt.compareSync(candidatePassword, this.password)
    return isMatch;
}

export const OAuthUser = mongoose.model<OAuthUserDocument>("OAuthUser", OAuthUserSchema);