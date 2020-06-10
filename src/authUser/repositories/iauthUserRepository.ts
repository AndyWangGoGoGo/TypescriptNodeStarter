import { Request, Response, NextFunction } from "express";
import { OAuthUserDocument } from "src/auth/models/oauthUser";

/* eslint-disable @typescript-eslint/interface-name-prefix */
export interface IAuthUserRepository
{
    createPhoneUser(phone: number, passwd: string, roles: string, scope: string): Promise<OAuthUserDocument>;
    createMailUser(email: string, passwd: string, roles: string, scope: string): Promise<OAuthUserDocument>;
    createOpenIdUser(phone: number, openid: string, roles: string, scope: string): Promise<OAuthUserDocument>;
    rebindPhone2OpenId(phone: number, openid: string): Promise<OAuthUserDocument>;
    deleteUser(userId: string): Promise<any>;
    getUsers(page: number, pageSize: number): Promise<OAuthUserDocument[]>;
    cleanUser(userId: string): Promise<any>;
}