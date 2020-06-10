import express, { Request, Response, NextFunction } from "express";
import logger from "./utils/logger";
import mongoose from "mongoose";
import path from "path";
import bodyParser from "body-parser";
import { Router } from "./routes/router";
import { MONGODB_URI } from "./utils/dotENV";
import { HttpStatusCode } from "./response/httpStatusCode";
import responseTools from "./response/responseTools";

class App {
    app: express.Application = express();
    _mongoUrl: string;
    _routes: Router = new Router();

    constructor(mongoUrl: string) {
        this._mongoUrl = mongoUrl;
        this._routes = new Router();

        this.app = express();
        this.config();
        this.mongoSetup(this._mongoUrl);

        this._routes.routePrv(this.app);

        this.app.use((request: Request, response: Response) => {
            return responseTools.responseFail(HttpStatusCode.NotFound, null, "Notfound.", response);
        });
    }

    private config = (): void => {
        // serving static files 
        const folder = "assets";
        const fileFolder = path.resolve(folder);
        this.app.use(express.static(fileFolder))

        this.app.use(express.json());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.set("port", process.env.PORT || 3001);

        this.app.all("/*", (request: Request, response: Response, next: NextFunction) => {
            if (request.method !== "GET") {
                logger.info(request.originalUrl);
            }
            next();
        });
    }

    private mongoSetup = (connStr: string): void => {
        mongoose.connect(connStr, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false }).then(
            () => { logger.info("MongoDB connection success!"); }
        ).catch(
            (err) => { logger.error("MongoDB connection error. Please make sure MongoDB is running. " + err); }
        );
    }
}

export default new App(MONGODB_URI).app;