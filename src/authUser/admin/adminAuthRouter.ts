import { Router } from "express";
import { AdminAuthController } from "./adminAuthController";

export class AdminAuthRouter {

    private _authrController: AdminAuthController;
    private _router: Router;

    constructor(authrController: AdminAuthController)
    {
        this._authrController = authrController;
        this._router = Router();
        this.initRouter(this._router);
    }

    private initRouter = (router: Router): void => {
        router.route("/token")
        .post(this._authrController.token);

        router.route("/code/mail")
        .post(this._authrController.mailCode);

        router.route("/code/phone")
        .post(this._authrController.phoneCode);

        router.route("/signup/mail")
        .post(this._authrController.mailSignup, this._authrController.token);

        router.route("/signup/phone")
        .post(this._authrController.phoneSignup, this._authrController.token);
        
        router.route("/users")
        .all(this._authrController.authenticate)
        .get(this._authrController.getUsers);

        router.route("/users/:userId")
        .all(this._authrController.authenticate)
        .delete(this._authrController.deleteUser);

        router.route("/test/clean/:userId")
        .delete(this._authrController.authenticate, this._authrController.cleanAuth);
    }

    router = (app): void => {
        app.use("/api/v1/admin/auth", this._router);
    }
}