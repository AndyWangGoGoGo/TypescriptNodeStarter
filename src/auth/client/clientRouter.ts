import { Router } from "express";
import { ClientController } from "./clientController";

export class ClientRouter {
    private _clientController: ClientController;
    private _router: Router;

    constructor(clientController: ClientController) {
        this._clientController = clientController;
        this._router = Router();
        this.initRouter(this._router);
    }

    private initRouter = (router: Router): void => {

        router.route("")
            .get(this._clientController.getClients)
            .post(this._clientController.create);

            router.route("/:id")
            .patch(this._clientController.update)
            .delete(this._clientController.delete);

        router.route("/test/clean/:id")
            .delete(this._clientController.clean);
    }

    router = (app): void => {
        app.use("/api/v1/admin/clients", this._router);
    }
}