import mongoose from "mongoose";
import randomCode from "../../utils/randomCode";

const Schema = mongoose.Schema;

export type OAuthClientDocument = mongoose.Document & {
    clientName: string;
    clientId: string;
    clientSecret: string;
    grants: Array<string>;//["'authorization_code', 'password', 'refresh_token', 'client_credentials'"]
    clientType: number;
    status: number;
};

const ClientSchema = new Schema({
    clientName: {
        type: String,
        unique: "Client Name already exists",
        lowercase: true,
        trim: true,
        required: "Please fill the name of your client account"
    },
    clientId: {
        type: String,
        unique: true,
        required: "Please fill the id of your client account"
    },
    clientSecret: {
        type: String,
        required: true,
        default: randomCode.generateCode(20),
    },
    grants:{
        type: Array,
        required: true
    },
    clientType: {
        type: Number,
        default: 1, // 0 admin, 1 app
        enum: [0, 1]
    },
    status: {
        type: Number,
        default: 1,  // 1 active, -1 block
        enum: [-1, 1]
    }
}, { timestamps: true });

export const OAuthClient = mongoose.model<OAuthClientDocument>("OAuthClient",ClientSchema);
