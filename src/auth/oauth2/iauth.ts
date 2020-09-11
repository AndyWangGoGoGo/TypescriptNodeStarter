import { Request, Response, NextFunction } from "express";

export interface IAuth {
    authenticateHandler(req: Request, res: Response, next: NextFunction): Promise<IClientAuth>;
    tokenHandler(req: Request, res: Response, next: NextFunction): Promise<boolean | IClientAuth>;
}

export interface IClientAuth {
    userId: string,
    clientId: string,
    accessToken: string,
    accessTokenExpiresAt: string,
    refreshToken: string,
    refreshTokenExpiresAt: string,
    scope: string
}