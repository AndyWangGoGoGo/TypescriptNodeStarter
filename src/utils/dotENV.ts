import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Set the env file
const option = ".development";
//const option = ".production";
const fileName = path.resolve("env", option +".env");

if (fs.existsSync(fileName)) {
    const result = dotenv.config({
        path: fileName
    });

    if (result.error) {
        throw result.error;
    }
}

export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

export const MONGODB_URI = prod ? process.env.MONGODB_URI : process.env.MONGODB_URI_LOCAL;

if (!MONGODB_URI) {
    if (prod) {
        logger.error("No mongo connection string. Set MONGODB_URI environment variable.");
    } else {
        logger.error("No mongo connection string. Set MONGODB_URI_LOCAL environment variable.");
    }
    process.exit(1);
}
