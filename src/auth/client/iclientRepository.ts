import {Request,Response,NextFunction} from "express";
import { OAuthClientDocument } from "../models/oauthClient";

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IClientRepository
{
    create(body: object): Promise<OAuthClientDocument>;
    getClients(page: number, pageSize: number): Promise<OAuthClientDocument[]>;
    update(clientId: string, clientName: string, body: object): Promise<OAuthClientDocument>;
    delete(clientId: string): Promise<OAuthClientDocument>;
    clean(clientId: string): Promise<any>;
}