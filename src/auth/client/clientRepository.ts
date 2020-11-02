import { IClientRepository } from "./iclientRepository";
import { OAuthClient, OAuthClientDocument } from "../models/oauthClient";

export class ClientRepository implements IClientRepository {

    create = async (body: object): Promise<OAuthClientDocument> => {

        const client = new OAuthClient(body);

        const existingClient = await OAuthClient.findOne({
            $or: [{
                clientId: client.clientId
            }, {
                clientName: client.clientName
            }]
        });
        if (existingClient) {
            return null;
        }
        else {
            return client.save();
        }
    };

    getClients = async (page: number, pageSize: number): Promise<OAuthClientDocument[]> => {
        const clients = await OAuthClient.find({ status: { $ne: -1 } }).limit(pageSize).skip((page - 1) * pageSize)
            .select("clientId clientName clientType clientSecret grants createdAt");
        return clients;
    };

    update = async (clientId: string, clientName: string, body: object): Promise<OAuthClientDocument> => {
        const existingClient = await OAuthClient.findOne({ clientName });
        if (existingClient) {
            return null;
        }
        const localClient = await OAuthClient.findOneAndUpdate({ _id: clientId }, body, { new: true })
            .select("clientId clientName clientType clientSecret grants createdAt");
        return localClient;
    };

    delete = async (clientId: string): Promise<OAuthClientDocument> => {
        const localClient = await OAuthClient.findOne({ _id: clientId });
        if (!localClient) {
            return null;
        }
        localClient.status = -1;
        return localClient.save();
    };

    //for autotest
    clean = async (clientId: string): Promise<any> => {
        return OAuthClient.deleteOne({ _id: clientId });
    };
}