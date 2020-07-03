import express, { Request, Response } from "express";
import logger from "./utils/logger";
import mongoose from "mongoose";
import path from "path";
import bodyParser from "body-parser";
import { Router } from "./router";
import { MONGODB_URI } from "./utils/dotENV";

class App {
    app: express.Application = express();
    private _routes: Router;

    constructor(mongoUrl: string) {
        this.app = express();
        this.initializeStaticFolder(this.app);
        this.initializeMiddlewares(this.app);

        this._routes = new Router();
        this._routes.initializeRouter(this.app);

        this.mongoSetup(mongoUrl);
        this.app.use((request: Request, response: Response) => {
            return response.status(404).json({ code: -1, data: null, msg: "Notfound" })
        });
    }

    private initializeStaticFolder = (app: express.Application): void =>{
        const folder = "assets";
        const fileFolder = path.resolve(folder);
        app.use(express.static(fileFolder))
    }

    private initializeMiddlewares = (app: express.Application): void =>{
        app.use(express.json());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
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