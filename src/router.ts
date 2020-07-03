import { ClientRouter } from "./auth/client/clientRouter";
import { ClientRepository } from "./auth/client/clientRepository";
import { ClientController } from "./auth/client/clientController";

import { AppAuthRouter } from "./authUser/app/appAuthRouter";
import { AppAuthController } from "./authUser/app/appAuthController";
import { OAuth2 } from "./auth/oauth2/oauth2";
import { OAuthModelsRepository } from "./auth/oauth2/oauthModelsRepository";

import { AuthUserRepository } from "./authUser/repositories/authUserRepository";
import { AdminAuthRouter } from "./authUser/admin/adminAuthRouter";
import { AdminAuthController } from "./authUser/admin/adminAuthController";

export class Router {
    private _authRouter: AppAuthRouter;
    private _adminAuthRouter: AdminAuthRouter;
    private _clientRouter: ClientRouter;

    constructor() {
        const clientRepository = new ClientRepository();
        const clientController = new ClientController(clientRepository);
        this._clientRouter = new ClientRouter(clientController);

        const authModelsRepository = new OAuthModelsRepository();
        const authUserRepository = new AuthUserRepository(authModelsRepository);
        const auth = new OAuth2(authModelsRepository);

        const authController = new AppAuthController(auth, authUserRepository, authModelsRepository);
        this._authRouter = new AppAuthRouter(authController);

        const adminAuthController = new AdminAuthController(auth, authUserRepository, authModelsRepository);
        this._adminAuthRouter = new AdminAuthRouter(adminAuthController);
    }

    //registered routing.
    initializeRouter = (app): void => {
        this._authRouter.router(app);
        this._adminAuthRouter.router(app);
        this._clientRouter.router(app);
        console.log("Registered router!");
    }
}
