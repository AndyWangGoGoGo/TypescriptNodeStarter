import { Router } from "express";
import { AppAuthController } from "./appAuthController";

export class AppAuthRouter {

    private _authrController: AppAuthController;
    private _router: Router;

    constructor(authrController: AppAuthController)
    {
        this._authrController = authrController;
        this._router = Router();
        this.initRouter(this._router);
    }

    private initRouter = (router: Router): void => {
        router.route("/token")
        .post(this._authrController.token);

        router.route("/token/code")
        .post(this._authrController.codeLogin);

        router.route("/token/openid")
        .post(this._authrController.openidLogin);
        
        router.route("/code/mail")
        .post(this._authrController.mailCode);

        router.route("/code/phone")
        .post(this._authrController.phoneCode);

        router.route("/signup/mail")
        .post(this._authrController.mailSignup, this._authrController.token);

        router.route("/signup/phone")
        .post(this._authrController.phoneSignup, this._authrController.token);
        
        router.route("/signup/openid")
        .post(this._authrController.miniSignup, this._authrController.token);

        router.route("/rebind/phone")
        .post(this._authrController.authenticate, this._authrController.rebindPhone2OpenId);
        
        router.route("/test/clean/:userId")
        .delete(this._authrController.authenticate, this._authrController.cleanAuth);
    }

    router = (app): void => {
        app.use("/api/v1/auth",this._router);
    }
}