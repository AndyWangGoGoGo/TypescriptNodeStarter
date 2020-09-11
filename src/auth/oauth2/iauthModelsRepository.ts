import { OAuthUserDocument } from "../models/oauthUser";
import { OAuthClientDocument } from "../models/oauthClient";
import { AuthorizationCodeDocument } from "../models/authorizationCode";
import { OAuthTokenDocument } from "../models/oauthToken";

export interface IAuthModelsRepository {
    getAccessToken(accessToken): Promise<OAuthTokenDocument>;
    getRefreshToken(refreshToken): Promise<OAuthTokenDocument>;
    getAuthorizationCode(authorizationCode): Promise<AuthorizationCodeDocument>;
    getClient(clientId: string, clientSecret: string): Promise<OAuthClientDocument>;
    getUser(userInfo: object): Promise<OAuthUserDocument>;
    saveToken(token, client, user): Promise<OAuthTokenDocument>;
    saveAuthorizationCode(code, client, user): Promise<AuthorizationCodeDocument>;
    revokeToken(token): Promise<boolean>;
    revokeAuthorizationCode(code): Promise<boolean>;
    //validateScope(user, client, scope): string;
    verifyScope(token, scope): boolean;
}