import {Request,Response,NextFunction} from "express";
import { IClientRepository } from "./iclientRepository";
import logger from "../../utils/logger";

enum ErrCode {
    CLIENTID_OR_CLIENTNAME_EXISTS = "CLIENTID_OR_CLIENTNAME_EXISTS",
    INVALID_CLIENT = "INVALID_CLIENT",
    CLIENT_NOTFOUND = "CLIENT_NOTFOUND",
    CLIENT_NOCONTENT = "CLIENT_NOCONTENT"
}

export class ClientController
{
    private _iclientRepository: IClientRepository;
    constructor(iClientRepository: IClientRepository)
    {
        this._iclientRepository = iClientRepository;
    }

    create = async(req: Request, res: Response, next: NextFunction): Promise<void | Response>=>{
        try
        {
            const { clientId, clientName, grants } = req.body;
            const body = { clientId, clientName, grants };
            const client = await this._iclientRepository.create(body);
            if(client){
                return this.responseSuccess(201, client, "Created.", res);
            }
            else{
                return this.responseWarn(200, {code: ErrCode.CLIENTID_OR_CLIENTNAME_EXISTS}, "ClientName or clientId field is already exists.", res);
            }
        }
        catch (e)
        {
            logger.error(e);
            next(e);
        }
        
    }

    getClients = async(req: Request, res: Response, next: NextFunction): Promise<void | Response>=>{
        try
        {
            let pageSize = req.query.pageSize || 5;
            let page = req.query.page || 1;
    
            pageSize = (Number)(pageSize);
            page = (Number)(page);
            const clients = await this._iclientRepository.getClients(page, pageSize);
            if(clients){
                return this.responseSuccess(200, clients, `${clients.length} client.`, res);
            }
            else{
                return this.responseWarn(200, {code: ErrCode.CLIENT_NOCONTENT}, "0 client.", res);
            }
        }
        catch (e)
        {
            logger.error(e);
            next(e);
        }
    }

    update = async(req: Request, res: Response, next: NextFunction): Promise<void | Response>=>{
        try
        {
            const { id } = req.params;
            const body = req.body;
            const clientName = body.clientName;
    
            if (body.clientId || body.clientId === "") {
                delete body.clientId;
            }
            if (body.clientSecret || body.clientSecret === "") {
                delete body.clientSecret;
            }

            const client = await this._iclientRepository.update(id, clientName, body);
            if(client){
                return this.responseSuccess(200, client, `${client.clientName} has been updated.`, res);
            }
            else{
                return this.responseWarn(200, {code: ErrCode.INVALID_CLIENT}, "The client is notfound or clientName/clientId field is already exists.", res);
            }
        }
        catch (e)
        {
            logger.error(e);
            next(e);
        }
    }

    delete = async(req: Request, res: Response, next: NextFunction): Promise<void | Response>=>{
        try
        {
            const { id } = req.params;
            const client = await this._iclientRepository.delete(id);
            if(client){
                return this.responseSuccess(204, null, "deleted.", res);
            }
            else{
                return this.responseWarn(200, {code: ErrCode.CLIENT_NOTFOUND}, "The client is notfound.", res);
            }
        }
        catch (e)
        {
            logger.error(e);
            next(e);
        }
    }

    clean = async(req: Request, res: Response, next: NextFunction): Promise<void | Response>=>{
        try
        {
            const { id } = req.params;
            const one = await this._iclientRepository.clean(id);
            if(one){
                return this.responseSuccess(204, one, `${one.deletedCount} client deleted.`, res);
            }
            else{
                return this.responseWarn(200, {code: ErrCode.CLIENT_NOTFOUND}, "Clean fail.", res);
            }
        }
        catch (e)
        {
            logger.error(e);
            next(e);
        }
    }

    private responseSuccess = (statusCode: number, data: object, msg: string, res: Response): void =>{
        res.status(statusCode).json({
            code: 0,
            data,
            msg
        });
    }

    private responseFail = (statusCode: number, data: object, msg: string, res: Response): void =>{
        res.status(statusCode).json({
            code: -1,
            data,
            msg
        });
    }

    private responseWarn = (statusCode: number, data: object, msg: string, res: Response): void =>{
        res.status(statusCode).json({
            code: 1,
            data,
            msg
        });
    }
}