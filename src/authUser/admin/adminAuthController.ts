/* eslint-disable @typescript-eslint/camelcase */
import { Request, Response, NextFunction } from "express";
import { ErrCode, AuthController } from "../controllers/authController";
import { IAuth } from "../../auth/oauth2/iauth";
import { IAuthUserRepository } from "../repositories/iauthUserRepository";
import { IAuthModelsRepository } from "../../auth/oauth2/iauthModelsRepository";
import { Roles } from "../../auth/models/oauthUser";
import logger from "../../utils/logger";

export class AdminAuthController extends AuthController {
    constructor(iauth: IAuth, authUserRepository: IAuthUserRepository, models: IAuthModelsRepository){
        super(iauth,authUserRepository,models)
        this.roles = Roles.Staff;
        this.clientType = 0;
    }

    getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        try{
            let pageSize = req.query.pageSize || 5;
            let page = req.query.page || 1;
            pageSize = (Number)(pageSize);
            page = (Number)(page);
            const users = await this._authUserRepository.getUsers(page, pageSize);
            if(users){
                return this.responseSuccess(200, users, "Success.", res);
            }
            else{
                return this.responseWarn(200, { code: ErrCode.INVALID_USER }, "The users are notfound.", res);
            }
        }
        catch(e){
            logger.error(e);
            next(e);
        }
        
    }

    deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        try{
             const { userId } = req.params;
            const one = await this._authUserRepository.deleteUser(userId);
            if(one){
                return this.responseSuccess(204, null, "Success.", res);
            }
            else{
                return this.responseWarn(200, { code: ErrCode.INVALID_USER }, "The user is notfound.", res);
            }
        }
        catch(e){
            logger.error(e);
            next(e);
        }
    }
}