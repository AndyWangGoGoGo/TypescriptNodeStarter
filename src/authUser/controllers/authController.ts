/* eslint-disable @typescript-eslint/camelcase */
import { Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";
import { IAuth } from "../../auth/oauth2/iauth";
import { Mailer } from "../../validationCode/mailer";
import { IMailer } from "../../validationCode/imailer";
import randomCode from "../../utils/randomCode";
import { ISMS } from "../../validationCode/isms";
import { SMS } from "../../validationCode/sms";
import { IAuthUserRepository } from "../repositories/iauthUserRepository";
import { IAuthModelsRepository } from "../../auth/oauth2/iauthModelsRepository";
import logger from "../../utils/logger";

export enum ErrCode {
    PHONE_EXISTS = "PHONE_EXISTS",
    EMAIL_EXISTS = "EMAIL_EXISTS",
    INVALID_CODE = "INVALID_CODE",
    INVALID_INFO = "INVALID_INFO",
    INVALID_USER = "INVALID_USER",
    INVALID_CLIENT = "INVALID_CLIENT",
    INVALID_AUTHORIZE = "INVALID_AUTHORIZE"
}

export class AuthController {

    protected readonly VALID_SCOPES = ["read", "write"];
    protected readonly VALID_GRANTS = ["password", "refresh_token", "authorization_code", "client_credentials"];

    protected _iauth: IAuth;
    private _mailer: IMailer;
    private _mailCodes: Map<string, string>;

    private _phone: ISMS;
    protected _phoneCodes: Map<string, string>;

    protected _authUserRepository: IAuthUserRepository;
    private readonly _timeout: number;

    protected _models: IAuthModelsRepository;
    private readonly ENVIRONMENT = process.env.NODE_ENV;
    private readonly dev = this.ENVIRONMENT === "development"; // Anything else is treated as 'dev'
    private _roles: string;
    private _clientType: number;

    constructor(iauth: IAuth, authUserRepository: IAuthUserRepository, models: IAuthModelsRepository, roles: string, clientType: number) {
        this._iauth = iauth;

        this._mailer = new Mailer();
        this._mailCodes = new Map<string, string>();

        this._phone = new SMS();
        this._phoneCodes = new Map<string, string>();

        this._authUserRepository = authUserRepository;
        this._timeout = 5 * 60 * 1000;
        this._models = models;

        this._roles = roles;
        this._clientType = clientType;
    }

    authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const authorization = req.headers.authorization;
        if (!authorization) {
            this.responseFail(401, { code: ErrCode.INVALID_INFO }, "authorization invalid for headers.", res);
        }
        try {
            const clientData = await this._iauth.authenticateHandler(req, res, next);
            if (clientData) {
                return next();
            }
            else {
                this.responseWarn(200, { code: ErrCode.INVALID_AUTHORIZE }, "Invalid token.", res);
            }
        }
        catch (e) {
            console.error(e);
            this.responseWarn(200, { code: ErrCode.INVALID_AUTHORIZE }, e, res);
        }
    }

    /**
     * @api {POST} /api/v1/auth/token Token
     * @apiVersion 1.0.0
     * @apiName getToken
     * @apiGroup Auth
     * 
     * @apiDescription The getToken lable of mark be used user login, then refreshToken lable of mark be used user refresh token.
     * Two features are same route.
     * Note:On The app start up time use the latest token to refresh a new token remain the user login does not expired. 
     * 
     * @apiParam {String} username (getToken) Exmple:email/phone. Used user login.
     * @apiParam {String} password (getToken) Exmple:password.Used user login.
     * @apiParam {String} grant_type (getToken/refreshToken) Exmple:password/refresh_token. Used user login and refresh token.
     * @apiParam {String} token (refreshToken) Exmple:token.Used user refresh token.
     *
     * @apiSuccess (Success 200) {Number} code ~.
     * @apiSuccess (Success 200) {String} msg ~.
     * @apiSuccess (Success 200) {Object} data ~.
     * @apiSuccessExample  {json} success-example
     * HTTP/1.1 200 OK
     * {
     *     "code": 0,
     *     "data": {
     *         "userId": "5e798ede4848e70f58756dad",
     *         "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZTc5OGVkZTQ4NDhlNzBmNTg3NTZkYWQiLCJpYXQiOjE1ODY4MzUzMTUsImV4cCI6MTU4NjkyMTcxNX0.XZYXZFnimalfg2B6qtwW5JdMCYsrR9vLWpWWQmU79NI"
     *     },
     *     "msg": "Success."
     * }
     * 
     * HTTP/1.1 200 OK
     * {
     *     "code": 1,
     *     "data": {
     *         "code": "INVALID_USER",
     *     },
     *     "msg": "The user is nofound."
     * }
     */
    token = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { grant_type } = req.body;
        if (!grant_type || grant_type === "") {
            this.responseFail(401, { code: ErrCode.INVALID_INFO }, "the grant_type field invalid.", res);
        }

        try {
            const data = await this._iauth.tokenHandler(req, res, next);
            if (typeof data === "object") {
                this.responseSuccess(200, data, "Success.", res);
            }
            else if(typeof data === "boolean") {
                this.responseWarn(200, { code: ErrCode.INVALID_USER }, "username or password invalid.", res);
            }
            else{
                this.responseWarn(200, { code: ErrCode.INVALID_USER }, "Unauthenticated user.", res);
            }
        }
        catch (e) {
            console.error(e);
            next(e);
        }
    }

    /**
     * @api {POST} /api/v1/auth/token/openid Token/openid
     * @apiVersion 1.0.0
     * @apiName getToken
     * @apiGroup Auth
     * 
     * @apiDescription The getToken lable of mark be used user login, then refreshToken lable of mark be used user refresh token.
     * Two features are same route.
     * Note:On The app start up time use the latest token to refresh a new token remain the user login does not expired. 
     * 
     * @apiParam {String} username (getToken required) Exmple:openid. Used wechat user login .
     * @apiParam {String} grant_type (getToken/refreshToken required) Exmple:refresh_token/authorization_code. Used user login and refresh token. If the username field is a openid,then this field value is authorization_code.
     * @apiParam {String} token (refreshToken required) Exmple:token.Used user refresh token.
     *
     * @apiSuccess (Success 200) {Number} code ~.
     * @apiSuccess (Success 200) {String} msg ~.
     * @apiSuccess (Success 200) {Object} data ~.
     * @apiSuccessExample  {json} success-example
     * HTTP/1.1 200 OK
     * {
     *     "code": 0,
     *     "data": {
     *         "userId": "5e798ede4848e70f58756dad",
     *         "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZTc5OGVkZTQ4NDhlNzBmNTg3NTZkYWQiLCJpYXQiOjE1ODY4MzUzMTUsImV4cCI6MTU4NjkyMTcxNX0.XZYXZFnimalfg2B6qtwW5JdMCYsrR9vLWpWWQmU79NI"
     *     },
     *     "msg": "Success."
     * }
     * 
     * HTTP/1.1 200 OK
     * {
     *     "code": 1,
     *     "data": {
     *         "code": "INVALID_USER",
     *     },
     *     "msg": "The user is nofound."
     * }
     */
    openidLogin = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { grant_type } = req.body;
        if (!grant_type || grant_type === "") {
            this.responseFail(401, { code: ErrCode.INVALID_INFO }, "the grant_type field invalid.", res);
        }

        try {
            const data = await this._iauth.tokenHandler(req, res, next);
            if (typeof data === "object") {
                this.responseSuccess(200, data, "Success.", res);
            }
            else if(typeof data === "boolean") {
                this.responseWarn(200, { code: ErrCode.INVALID_USER }, "username or password invalid.", res);
            }
            else{
                this.responseWarn(200, { code: ErrCode.INVALID_USER }, "Unauthenticated user.", res);
            }
        }
        catch (e) {
            console.log(e);
            this.responseWarn(200, { code: ErrCode.INVALID_AUTHORIZE }, e, res);
        }
    }

    /**
     * @api {POST} /api/v1/auth/signup/mail Signup/mail
     * @apiVersion 1.0.0
     * @apiName mailSignup
     * @apiGroup Auth
     *
     * @apiParam {String} email User email.
     * @apiParam {String} password User password.
     * @apiParam {String} confirmPassword User password.
     * @apiParam {String} code Verification code.
     * @apiParam {String} client_id ~.
     * @apiParam {String} client_secret ~.
     *
     * @apiSuccess (Success 200) {Number} code ~.
     * @apiSuccess (Success 200) {String} msg ~.
     * @apiSuccess (Success 200) {Object} data ~.
     * @apiSuccessExample  {json} success-example
     * HTTP/1.1 200 OK
     * {
     *     "code": 0,
     *     "data": {
     *         "userId": "5e798ede4848e70f58756dad",
     *         "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZTc5OGVkZTQ4NDhlNzBmNTg3NTZkYWQiLCJpYXQiOjE1ODY4MzUzMTUsImV4cCI6MTU4NjkyMTcxNX0.XZYXZFnimalfg2B6qtwW5JdMCYsrR9vLWpWWQmU79NI"
     *     },
     *     "msg": "Success."
     * }
     * 
     * HTTP/1.1 200 OK
     * {
     *     "code": 1,
     *     "data": {
     *         "code": "EMAIL_EXISTS",
     *     },
     *     "msg": "The user is nofound."
     * }
     */
    mailSignup = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        await check("email", "Email is not valid").isEmail().run(req);
        await check("password", "Password must be at least 6 characters long").isLength({ min: 6 }).run(req);
        await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);
        await check("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.responseFail(422, null, errors.array().toString(), res);
        }

        const { email, password, code, client_id, client_secret } = req.body;

        if (!client_id || !client_secret) {
            return this.responseFail(422, null, "Please fill client_id or client_secret field!", res);
        }

        if (!code || !this._mailCodes.has(email) || code !== this._mailCodes.get(email)) {
            console.log(`code:${code},get mail code:${this._mailCodes.get(email)},has:${this._mailCodes.has(email)}`);
            return this.responseFail(400, null, "Code is invalid.", res);
        }

        try {
            const client = await this._models.getClient(client_id, client_secret);
            if (!client || client.clientType !== this._clientType) {
                return this.responseFail(400, null, "Client is invalid!", res);
            }
            const existUser = await this._models.getUser({ email });
            if(existUser){
                return this.responseWarn(200, { code: ErrCode.EMAIL_EXISTS }, "Account with that email address already exists.", res);
            }
            else{
                const newUser = await this._authUserRepository.createMailUser(email, password, this._roles, this.VALID_SCOPES[0])
                if(!newUser){
                    this.responseWarn(200, { code: ErrCode.INVALID_USER }, "Signup failed.", res);
                }
            }
            req.body.username = email;
            req.body.grant_type = this.VALID_GRANTS[0];
            req.body.scope = this.VALID_SCOPES[0];
            req.body.roles = this._roles;
            next();
            this.setCodeTimeout(this._mailCodes, email, 1000);
        }
        catch (err) {
            logger.error(err);
            next(err);
        }
    }

    /**
     * @api {POST} /api/v1/auth/signup/phone Signup/phone
     * @apiVersion 1.0.0
     * @apiName phoneSignup
     * @apiGroup Auth
     *
     * @apiParam {String} phone User phone.
     * @apiParam {String} password User password.
     * @apiParam {String} confirmPassword User password.
     * @apiParam {String} code Verification code.
     * @apiParam {String} client_id ~.
     * @apiParam {String} client_secret ~.
     *
     * @apiSuccess (Success 200) {Number} code ~.
     * @apiSuccess (Success 200) {String} msg ~.
     * @apiSuccess (Success 200) {Object} data ~.
     * @apiSuccessExample  {json} success-example
     * HTTP/1.1 200 OK
     * {
     *     "code": 0,
     *     "data": {
     *         "userId": "5e798ede4848e70f58756dad",
     *         "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZTc5OGVkZTQ4NDhlNzBmNTg3NTZkYWQiLCJpYXQiOjE1ODY4MzUzMTUsImV4cCI6MTU4NjkyMTcxNX0.XZYXZFnimalfg2B6qtwW5JdMCYsrR9vLWpWWQmU79NI"
     *     },
     *     "msg": "Success."
     * }
     * 
     * HTTP/1.1 200 OK
     * {
     *     "code": 1,
     *     "data": {
     *         "code": "PHONE_EXISTS",
     *     },
     *     "msg": "The user is nofound."
     * }
     */
    phoneSignup = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        await check("phone", "phone is not valid").isMobilePhone("zh-CN" || "zh-TW" || "zh-HK").run(req);
        await check("password", "Password must be at least 6 characters long").isLength({ min: 6 }).run(req);
        await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.responseFail(422, null, errors.array().toString(), res);
        }

        const { phone, password, code, client_id, client_secret } = req.body;

        if (!client_id || !client_secret) {
            return this.responseFail(422, null, "Please fill client_id or client_secret field!", res);
        }

        if (!code || !this._phoneCodes.has(phone) || code !== this._phoneCodes.get(phone)) {
            console.log(`code:${code},phone tempCode:${this._phoneCodes.get(phone)}`);
            return this.responseFail(400, null, "Code is invalid.", res);
        }

        try {
            const client = await this._models.getClient(client_id, client_secret);
            if (!client || client.clientType !== this._clientType) {
                return this.responseFail(400, null, "Client is invalid!", res);
            }

            const existUser = await this._models.getUser({ phone });
            
            if(existUser){
                if (existUser.openid === existUser.username) {
                    existUser.username = phone.toString();
                    existUser.password = password;
                    existUser.scope = this.VALID_SCOPES[0];
                    existUser.roles = this._roles;
                    existUser.save();
                }
                else{
                    return this.responseWarn(200, { code: ErrCode.PHONE_EXISTS }, "Account with that phone number already exists.", res);
                }
            }
            else{
                const newUser = await this._authUserRepository.createPhoneUser(phone, password, this._roles, this.VALID_SCOPES[0])
                if(!newUser){
                    return this.responseWarn(200, { code: ErrCode.INVALID_USER }, "Signup failed.", res);
                }
            }


            req.body.username = phone.toString();
            req.body.grant_type = this.VALID_GRANTS[0];
            req.body.scope = this.VALID_SCOPES[0];
            req.body.roles = this._roles;
            next();
            this.setCodeTimeout(this._phoneCodes, phone, 1000);
        }
        catch (err) {
            logger.error(err);
            next(err);
        }
    }

    /**
     * @api {POST} /api/v1/auth/code/mail Code/mail
     * @apiVersion 1.0.0
     * @apiName mailCode
     * @apiGroup Auth
     *
     * @apiParam {String} email User email.
     *
     * @apiSuccess (Success 200) {Number} code ~.
     * @apiSuccess (Success 200) {String} msg ~.
     * @apiSuccess (Success 200) {Object} data ~.
     * @apiSuccessExample  {json} success-example
     * HTTP/1.1 200 OK
     * {
     *     "code": 0,
     *     "data": {},
     *     "msg": "Success."
     * }
     */
    mailCode = async (req: Request, res: Response): Promise<void | Response> => {
        await check("email", "Email is not valid").isEmail().run(req);
        await check("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.responseFail(422, null, errors.array().toString(), res);
        }

        const mail = req.body.email;
        const code = randomCode.generateCode(5);
        console.log(`mail:${mail},code:${code}`);
        this._mailer.sendCode(mail, code)
            .then(() => {
                this._mailCodes.set(mail, code);
                this.setCodeTimeout(this._mailCodes, mail, this._timeout);
                if (this.dev) {
                    return this.responseSuccess(200, { code }, "Success!", res);
                }
                else {
                    return this.responseSuccess(200, null, "Success!", res);
                }
            })
            .catch((err) => {
                console.error(`send mail code faild:${err}`);
                return this.responseWarn(200, null, err, res);
            });
    }

    /**
     * @api {POST} /api/v1/auth/code/phone Code/phone
     * @apiVersion 1.0.0
     * @apiName phonecode
     * @apiGroup Auth
     *
     * @apiParam {String} phone User phone.
     *
     * @apiSuccess (Success 200) {Number} code ~.
     * @apiSuccess (Success 200) {String} msg ~.
     * @apiSuccess (Success 200) {Object} data ~.
     * @apiSuccessExample  {json} success-example
     * HTTP/1.1 200 OK
     * {
     *     "code": 0,
     *     "data": {},
     *     "msg": "Success."
     * }
     */
    phoneCode = async (req: Request, res: Response): Promise<void | Response> => {
        await check("phone", "phone is not valid").isMobilePhone("zh-CN" || "zh-TW" || "zh-HK").run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.responseFail(422, null, errors.array().toString(), res);
        }

        const phone = req.body.phone;
        const code = randomCode.generateCode(5);
        console.log(`phone:${phone},code:${code}`);
        this._phone.SendSMS(phone, code)
            .then(() => {
                this._phoneCodes.set(phone, code);
                this.setCodeTimeout(this._phoneCodes, phone, this._timeout);
                if (this.dev) {
                    return this.responseSuccess(200, { code }, "Success!", res);
                }
                else {
                    return this.responseSuccess(200, null, "Success!", res);
                }
            })
            .catch((err) => {
                console.error(`send phone code faild:${err}`);
                return this.responseWarn(200, null, err, res);
            });
    }

    /**
     * @api {POST} /api/v1/auth/rebind/phone RebindPhone
     * @apiVersion 1.0.0
     * @apiName rebindPhone
     * @apiGroup Auth
     *
     * @apiParam {String} openid wechat openid.
     * @apiParam {String} phone User phone.
     * @apiParam {String} code Verification code.
     *
     * @apiSuccess (Success 200) {Number} code ~.
     * @apiSuccess (Success 200) {String} msg ~.
     * @apiSuccess (Success 200) {Object} data ~.
     * @apiSuccessExample  {json} success-example
     * HTTP/1.1 200 OK
     * {
     *     "code": 0,
     *     "data": {
     *          "email": "",
     *          "phone": 18729590770,
     *          "openid": "oNeUF5sJx71fkhxb9DsLvnJtIow8",
     *          "scope": "read",
     *          "roles": "user",
     *          "status": 0,
     *          "_id": "5e799537befb6a1cfc1390f4",
     *          "username": "oNeUF5sJx71fkhxb9DsLvnJtIow8"
     * },
     *     "msg": "Success."
     * }
     */
    rebindPhone2OpenId = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        await check("phone", "phone is not valid").isMobilePhone("zh-CN" || "zh-TW" || "zh-HK").run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.responseFail(422, null, errors.array().toString(), res);
        }

        const { phone, code, openid } = req.body;

        if (!code || !this._phoneCodes.has(phone) || code !== this._phoneCodes.get(phone)) {
            logger.info(`code:${code},phone tempCode:${this._phoneCodes.get(phone)}`);
            return this.responseFail(400, null, "Code is invalid.", res);
        }

        try {
            const existUser = await this._models.getUser({ phone: phone })
            if(existUser){
                return this.responseWarn(200, { code: ErrCode.PHONE_EXISTS }, "The phone is already existed in system.", res);
            }

            const newUser = await this._authUserRepository.rebindPhone2OpenId(phone, openid);
            if(newUser){
                this.setCodeTimeout(this._phoneCodes, phone, 1000);
                return this.responseSuccess(200, newUser, "Success.", res);
            }
            else{
                return this.responseWarn(200, { code: ErrCode.INVALID_INFO }, "Invalid openid.", res);
            }
        }
        catch (e) {
            logger.error(e);
            next(e);
        }
    }

    //for test
    cleanAuth = async (req: Request, res: Response, next: NextFunction): Promise<unknown> => {
        try {
            const { userId } = req.params;
            return this._authUserRepository.cleanUser(userId);
        }
        catch (e) {
            logger.error(e);
            next(e);
        }
    }

    protected setCodeTimeout = (codes: Map<string, string>, key: string, timeout: number): void => {
        setTimeout(() => {
            if (codes.has(key)) {
                codes.delete(key);
            }
        }, timeout);
    }

    protected responseSuccess = (statusCode: number, data: object, msg: string, res: Response): void => {
        res.status(statusCode).json({
            code: 0,
            data,
            msg
        });
    }

    protected responseWarn = (statusCode: number, data: object, msg: string, res: Response): void => {
        res.status(statusCode).json({
            code: 1,
            data,
            msg
        });
    }

    protected responseFail = (statusCode: number, data: object, msg: string, res: Response): void => {
        res.status(statusCode).json({
            code: -1,
            data,
            msg
        });
    }
}