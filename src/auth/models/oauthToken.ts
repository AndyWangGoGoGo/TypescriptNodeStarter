import { OAuthClientDocument } from './oauthClient';
import mongoose from "mongoose";
import { OAuthUserDocument } from "./oauthUser";
const Schema = mongoose.Schema;

export type OAuthTokenDocument = mongoose.Document & {
    accessToken: string;
    accessTokenExpiresAt: Date;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
    client: OAuthClientDocument;
    user: OAuthUserDocument;
    scope: string;
};

const OAuthTokenSchema = new Schema({
    accessToken: { type: String },
    accessTokenExpiresAt: { type: Date },
    refreshToken: { type: String },
    refreshTokenExpiresAt: { type: Date },
    user:  { type : Schema.Types.ObjectId, ref: 'OAuthUser' },// `client` and `user` are required in multiple places, for example `getAccessToken()`
    client: { type : Schema.Types.ObjectId, ref: 'ClientRecord' },
    scope:  { type: String }
}, { timestamps: true });

export const OAuthToken = mongoose.model<OAuthTokenDocument>("OAuthToken", OAuthTokenSchema);
