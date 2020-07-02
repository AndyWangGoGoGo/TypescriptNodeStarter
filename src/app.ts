import express, { Request, Response, NextFunction } from "express";
import logger from "./utils/logger";
import mongoose from "mongoose";
import path from "path";
import bodyParser from "body-parser";
import { Router } from "./routes/router";
import { MONGODB_URI } from "./utils/dotENV";

class App {
    app: express.Application = express();
    private _mongoUrl: string;
    private _routes: Router = new Router();

    constructor(mongoUrl: string) {
        this._mongoUrl = mongoUrl;
        this._routes = new Router();

        this.app = express();

        this.initializeStaticFolder();
        this.initializeMiddlewares();

        this._routes.initializeRouter(this.app);
        this.mongoSetup(this._mongoUrl);
        this.app.use((request: Request, response: Response) => {
            return response.status(404).json({ code: -1, data: null, msg: "Notfound" })
        });
    }

    private initializeMiddlewares = (): void =>{
        this.app.use(express.json());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.all("/*", (request: Request, response: Response, next: NextFunction) => {
            if (request.method !== "GET") {
                logger.info(request.originalUrl);
            }
            next();
        });
    }

    private initializeStaticFolder = (): void =>{
        const folder = "assets";
        const fileFolder = path.resolve(folder);
        this.app.use(express.static(fileFolder))
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