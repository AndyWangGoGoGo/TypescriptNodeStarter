/* eslint-disable @typescript-eslint/camelcase */
import { Request, Response } from "express";
import OAuth2Server from "oauth2-server";
import { IAuthModelsRepository } from "./iauthModelsRepository";
import { IAuth, IClientAuth } from "./iauth";
import logger from "../../utils/logger";


export class OAuth2 implements IAuth {
    private _oauthServer: OAuth2Server;
    private _models: IAuthModelsRepository;
    public get oauthServer(): OAuth2Server {
        return this._oauthServer;
    }

    constructor(models: IAuthModelsRepository) {
        this._models = models;
        this._oauthServer = new OAuth2Server({
            model: models,
            grants: ["authorization_code", "password", "refresh_token"],
            allowBearerTokensInQueryString: true,
            accessTokenLifetime: process.env.JWT_EXPIRES_IN || 60 * 60 * 24 //60 * 60 * 24, // 24 hours, or 1 day
        });
    }

    authenticateHandler = (req: Request, res: Response): Promise<IClientAuth> => {
        const request = new OAuth2Server.Request(req);
        const response = new OAuth2Server.Response(res);

        return this._oauthServer.authenticate(request, response)
            .then((token) => {
                let clientAuth = null;
                if (token) {
                    clientAuth = {
                        "userId": token.user._id,
                        "clientId": token.client.clientId,
                        "accessToken": token.accessToken,
                        "accessTokenExpiresAt": token.accessTokenExpiresAt,
                        "refreshToken": token.refreshToken,
                        "refreshTokenExpiresAt": token.refreshTokenExpiresAt,
                        "scope": token.scope
                    }

                }
                return clientAuth;
            })
            .catch((err) => {
                logger.info(`authenticateHandler err:${err}`);
                return null;
            });
    }

    authorizeHandler = (req: Request, res: Response): Promise<unknown> => {
        const request = new OAuth2Server.Request(req);
        const response = new OAuth2Server.Response(res);
        return this._oauthServer.authorize(request, response)
            .then((code) => {
                logger.info(`code:${code}`);

                if (!code) {
                    return res.status(200).json({
                        msg: "The code is undefined!",
                    });
                }
            })
            .catch((err) => {
                logger.info(`authorizeHandler err:${err}`);
                return null;
            });
    }

    tokenHandler = async(req: Request, res: Response): Promise< boolean | IClientAuth> => {
        const { grant_type } = req.body;
        if (grant_type && grant_type !== "refresh_token") {
            const isMatch =  await this.validateUser(req);
            if(!isMatch){
                return isMatch;
            }
        }

        const request = new OAuth2Server.Request(req);
        const response = new OAuth2Server.Response(res);
        return this._oauthServer.token(request, response)
            .then((token) => {
                let clientAuth = null;
                if(token){
                    clientAuth = {
                        "userId": token.user._id,
                        "clientId": token.client.clientId,
                        "accessToken": token.accessToken,
                        "accessTokenExpiresAt": token.accessTokenExpiresAt,
                        "refreshToken": token.refreshToken,
                        "refreshTokenExpiresAt": token.refreshTokenExpiresAt,
                        "scope": token.scope
                    }
                }
                 
                return clientAuth;
            })
            .catch(()=>{
                return null;
            });
    }

    private validateUser = async(req: Request): Promise<boolean> => {
        const { username, password } = req.body;
        let isMatch = false;
        const user = await this._models.getUser({username});
        if (user) {
            isMatch = user.comparePassword(password)
            if (isMatch) {
                req.body.password = user.password;
            }
        } 
        logger.info(`username:${username},isMatch:${isMatch}`);
        return isMatch;
    }
}