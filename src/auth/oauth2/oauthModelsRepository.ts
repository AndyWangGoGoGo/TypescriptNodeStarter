import { IAuthModelsRepository } from "./iauthModelsRepository";
import { OAuthToken, OAuthTokenDocument } from "../models/oauthToken";
import { AuthorizationCode, AuthorizationCodeDocument } from "../models/authorizationCode";
import { OAuthUser, OAuthUserDocument } from "../models/oauthUser";
import { OAuthClient,  OAuthClientDocument } from "../models/oauthClient";

export class OAuthModelsRepository implements IAuthModelsRepository {
    // list of valid scopes
    private readonly VALID_SCOPES = ["read", "write"];

    /**
     * Get access token.
     */
    getAccessToken(bearerToken: string): Promise<OAuthTokenDocument> {
        return OAuthToken
            .findOne({ accessToken: bearerToken })
            .then((accessToken) => {
                //console.log('at accessToken:', accessToken)
                return accessToken;
            })
            .catch((err) => {
                console.log(`getAccessToken - Err:${err}`);
                return null;
            });
    }

    /**
    * Get refresh token.
    */
    getRefreshToken(refreshToken: string): Promise<OAuthTokenDocument> {
        return OAuthToken
            .findOne({ refreshToken: refreshToken })
            .populate("client")
            .then((localRefreshToken) => {
                //console.log(`client id:${localRefreshToken.client.id},client:${localRefreshToken.client}`);
                return localRefreshToken;
            })
            .catch((err) => {
                console.log(`getRefreshToken - Err:${err}`);
                return null;
            });
    }

    getAuthorizationCode(authorizationCode: string): Promise<AuthorizationCodeDocument> {
        return AuthorizationCode
            .findOne({ authorizationCode: authorizationCode })
            .then((code) => {
                console.log(`at code:${code}`);
                return code;
            })
            .catch((err) => {
                console.log(`getAuthorizationCode - Err:${err}`);
                return null;
            });
    }

    /**
    * Get client.
    */
    getClient(clientId: string, clientSecret: string): Promise<OAuthClientDocument> {
        const params = { clientId: clientId, clientSecret: "" };
        if (clientSecret) {
            params.clientSecret = clientSecret;
        }
        return OAuthClient.findOne(params)
            .then((client) => {
                //console.log('at client', client)
                return client;
            })
            .catch((err) => {
                console.log(`getClient - Err:${err}`);
                return null;
            });
    }

    getUser = (userInfo: object): Promise<OAuthUserDocument> => {
        let param: object = userInfo;
        if(typeof userInfo !== "object"){
            param = {username: userInfo}
        }
        return OAuthUser.findOne(param)
            .select("email phone scope roles status username password")
            .then((user) => {
                //console.log('at user:', user)
                return user;
            })
            .catch((err)=> {
                //console.log(`getUser - Err:${err}`);
                return null;
            });
    }

    /**
    * Save token.
   */
    saveToken(token: OAuthTokenDocument, client: OAuthClientDocument, user: OAuthUserDocument): Promise<OAuthTokenDocument> {
        const oauthToken = new OAuthToken({
            accessToken: token.accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt,
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: token.refreshTokenExpiresAt,
            scope: token.scope,
            client: client,
            user: user
        });

        // Can't just chain `lean()` to `save()` as we did with `findOne()` elsewhere. Instead we use `Promise` to resolve the data.
        return OAuthToken
            .create(oauthToken)
            .then((accessToken) => {
                return accessToken;
            }).catch((err) => {
                console.log("saveToken - Err: ", err)
                return null;
            });
    }

    saveAuthorizationCode(code: AuthorizationCodeDocument, client: OAuthClientDocument, user: OAuthUserDocument): Promise<AuthorizationCodeDocument> {
        const authCode = new AuthorizationCode({
            authorizationCode: code.authorizationCode,
            expiresAt: code.expiresAt,
            redirectUri: code.redirectUri,
            scope: code.scope,
            client: client,
            user: user
        });
        return AuthorizationCode
            .create(authCode)
            .then((authorizationCode) => {
                return authorizationCode;
            }).catch((err) => {
                console.log("saveAuthorizationCode - Err: ", err)
                return null;
            });
    }

    revokeToken(token: OAuthTokenDocument): Promise<boolean> {
        return OAuthToken
            .deleteOne({ refreshToken: token.refreshToken })
            .then((localToken) => {
                //console.log(`revoke token:${localToken}`);
                return !!localToken;
            }).catch((err) => {
                console.log("revokeToken - Err: ", err)
                return false;
            });
    }

    revokeAuthorizationCode(code: AuthorizationCodeDocument): Promise<boolean> {
        console.log("revokeAuthorizationCode", code)
        return AuthorizationCode
            .deleteOne({ authorizationCode: code.authorizationCode })
            .then((rCode) => {
                console.log(`revoke authorizationCode:${rCode}`);
                return !!rCode;
            }).catch((err) => {
                console.log("revokeAuthorizationCode - Err: ", err)
                return false;
            });
    }

    // validateScope(user: OAuthUserDocument, client: OAuthClientDocument, scope: string): string {
    //     if (!scope) {
    //         return null;
    //     }

    //     if (!scope.split(" ").every(s => this.VALID_SCOPES.includes(s))) {
    //         return null;
    //     }
    //     return scope
    // }

    verifyScope(token: OAuthTokenDocument, scope: string): boolean {
        if (!token.scope) {
            return false;
        }

        const requestedScopes = scope.split(" ");
        const authorizedScopes = token.scope.split(" ");
        return requestedScopes.every(s => authorizedScopes.includes(s));
    }
}
