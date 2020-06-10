import mongoose from "mongoose";
import { OAuthClientDocument } from "./oauthClient";
import { OAuthUserDocument } from "./oauthUser";

const Schema = mongoose.Schema;

export type AuthorizationCodeDocument = mongoose.Document & {
        authorizationCode: string;
        expiresAt: Date;
        redirectUri: string;
        client: OAuthClientDocument;
        user: OAuthUserDocument;
        scope: string;
};

const AuthorizationCodeSchema = new Schema({
        authorizationCode: String,
        expiresAt: Date,
        redirectUri:  String,
        scope:  String,
        user:  { type : Schema.Types.ObjectId, ref: 'OAuthUser' },
        client: { type : Schema.Types.ObjectId, ref: 'ClientRecord' },
}, { timestamps: true });

export const AuthorizationCode = mongoose.model<AuthorizationCodeDocument>("AuthorizationCode", AuthorizationCodeSchema);
