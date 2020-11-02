import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Set the env file
const ENVIRONMENT = process.env.NODE_ENV;

let option = "production";
if (ENVIRONMENT === "development") {
    option = "development";
}
else if (ENVIRONMENT === "sit") {
    option = "sit";
}

const fileName = path.resolve("env", option + ".env");

if (fs.existsSync(fileName)) {
    const result = dotenv.config({
        path: fileName
    });

    if (result.error) {
        logger.error(result.error);
    }
}

export const MONGODB_URI = process.env.MONGODB_URI;
export const PORT = process.env.PORT;

if (!MONGODB_URI) {
    logger.error(`${option}:No mongo connection string. Set MONGODB_URI environment variable.`);
    process.exit(1);
}