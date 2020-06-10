/* eslint-disable @typescript-eslint/camelcase */
import { Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";
import logger from "../../utils/logger";
import { ErrCode, AuthController } from "../controllers/authController";
import { Roles } from "../repositories/authUserRepository";

export class AppAuthController extends AuthController {

    /**
     * @api {POST} /api/v1/auth/token/code Token/code
     * @apiVersion 1.0.0
     * @apiGroup Auth
     *
     * @apiParam {String} username User phone.
     * @apiParam {String} grant_type Exmple:code.
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
     *         "userId": "5e798ede4848e70f58756dad",
     *         "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZTc5OGVkZTQ4NDhlNzBmNTg3NTZkYWQiLCJpYXQiOjE1ODY4MzUzMTUsImV4cCI6MTU4NjkyMTcxNX0.XZYXZFnimalfg2B6qtwW5JdMCYsrR9vLWpWWQmU79NI"
     *     },
     *     "msg": "Success."
     * }
     */
    codeLogin = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const { username, code } = req.body;
            if (code && this._phoneCodes.has(username) && (code === this._phoneCodes.get(username))) {
                logger.debug(`code:${code},tempCode:${this._phoneCodes.get(username)}`);
                this._iauth.tokenHandler(req, res, next);
                this.setCodeTimeout(this._phoneCodes, username, 1000);
            } else {
                return this.responseFail(400, null, "Code is not valid.", res);
            }
        }
        catch (e) {
            logger.error(e);
            next(e);
        }
    }

    /**
     * @api {POST} /api/v1/auth/signup/openid Signup/openid
     * @apiVersion 1.0.0
     * @apiGroup Auth
     *
     * @apiParam {String} openid wechat openid.
     * @apiParam {String} phone User phone.
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
    miniSignup = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        await check("phone", "phone is not valid").isMobilePhone("zh-CN" || "zh-TW" || "zh-HK").run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.responseFail(422, null, errors.array().toString(), res);
        }

        const {openid, phone, code, client_id, client_secret } = req.body;

        if (!openid || !client_id || !client_secret) {
            return this.responseFail(422, null, "Please fill openid/client_id/client_secret field!", res);
        }

        if (!code || !this._phoneCodes.has(phone) || code !== this._phoneCodes.get(phone)) {
            console.log(`code:${code},phone tempCode:${this._phoneCodes.get(phone)}`);
            return this.responseFail(400, null, "Code is not valid.", res);
        }

        try {
            const client = this._models.getClient(client_id, client_secret)
            if (!client) {
                return this.responseFail(400, null, "Client is not valid.", res);
            }

            logger.debug(`username/openid: ${phone} is signup.`);
            const existUser = await this._models.getUser({ openid: openid });
            if(existUser){
                if(existUser.phone !== phone){
                    logger.info("auth phone to delete code.");
                    const tempPhone = phone.toString().substring(7, 11);//TODO
                    return this.responseWarn(200, { code: ErrCode.PHONE_EXISTS }, `The end number ${tempPhone} that phone number has been bind to the account.`, res);
                }
            }
            else{
                const newUser = await this._authUserRepository.createOpenIdUser(phone, openid, Roles.User, this.VALID_SCOPES[0] )
                if (!newUser) {
                    return this.responseWarn(200, { code: ErrCode.INVALID_USER }, "Create user failed.", res);
                }
            }

            req.body.username = openid;
            req.body.grant_type = this.VALID_GRANTS[2];
            req.body.scope = this.VALID_SCOPES[0];
            req.body.roles = Roles.User;
            next();
            this.setCodeTimeout(this._phoneCodes, phone, 1000);
        }
        catch (err) {
            logger.error(err);
            next(err);
        }
    }
}