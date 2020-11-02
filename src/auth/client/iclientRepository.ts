import { OAuthClientDocument } from "../models/oauthClient";

export interface IClientRepository {
    create (body: object): Promise<OAuthClientDocument>;
    getClients (page: number, pageSize: number): Promise<OAuthClientDocument[]>;
    update (clientId: string, clientName: string, body: object): Promise<OAuthClientDocument>;
    delete (clientId: string): Promise<OAuthClientDocument>;
    clean (clientId: string): Promise<any>;
}