import { IAuthUserRepository } from "./iauthUserRepository";
import { OAuthUser, OAuthUserDocument, Roles } from "../../auth/models/oauthUser";
import { IAuthModelsRepository } from "../../auth/oauth2/iauthModelsRepository";
import logger from "../../utils/logger";

export class AuthUserRepository implements IAuthUserRepository {

    private _iauthModelsRepository: IAuthModelsRepository;

    constructor(iauthModelsRepository: IAuthModelsRepository) {
        this._iauthModelsRepository = iauthModelsRepository;
    }

    createPhoneUser = async (phone: number, password: string, roles: string, scope: string): Promise<OAuthUserDocument> => {
        const user = new OAuthUser({
            phone,
            username: phone,
            password,
            scope,
            roles: roles || Roles.User
        });

        return user.save();
    }

    createMailUser = async (email: string, password: string, roles: string, scope: string): Promise<OAuthUserDocument> => {

        const user = new OAuthUser({
            email,
            username: email,
            password,
            scope,
            roles: roles || Roles.User
        });

        return user.save();
    }

    //phone and openid requerd.
    createOpenIdUser = async (phone: number, openid: string, roles: string, scope: string): Promise<OAuthUserDocument> => {
        const user = new OAuthUser({
            phone,
            username: openid,
            openid,
            password: "0",
            scope,
            roles: roles || Roles.User
        });
        const phoneUser = await this._iauthModelsRepository.getUser({ phone: phone })
        if (phoneUser) {
            phoneUser.openid = openid;
            return phoneUser.save();
        }
        else {
            return user.save();
        }
    }

    rebindPhone2OpenId = async (phone: number, openid: string): Promise<OAuthUserDocument> => {
        const openidUser = await this._iauthModelsRepository.getUser({ openid: openid })
        if (openidUser && openidUser.phone !== phone) {
            openidUser.phone = phone;
            return openidUser.save()
        }
        else {
            return null;
        }
    }

    deleteUser = (userId: string): Promise<OAuthUserDocument> => {
        return OAuthUser.findOne({ _id: userId })
            .then(async (localUser) => {
                if (localUser) {
                    localUser.status = -1;
                    return localUser.save()
                }
                else {
                    return null;
                }
            })
            .catch(() => {
                return null;
            });
    }

    getUsers = (page: number, pageSize: number): Promise<OAuthUserDocument[]> => {
        return OAuthUser.find({ status: { $ne: -1 } }).limit(pageSize).skip((page - 1) * pageSize)
            .select("email phone scope roles status username")
            .then((localUsers) => {
                return localUsers;
            })
            .catch(() => {
                return null;
            });
    }

    //for test
    cleanUser = (userId: string): Promise<any> => {
        logger.info(`userId:${userId}`);
        return OAuthUser.deleteOne({ _id: userId })
            .then((one) => {
                return one;
            })
            .catch(() => {
                return null;
            });
    }
}