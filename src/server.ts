import app from "./app";
import logger from "./utils/logger";

app.listen(app.get("port"), () => {
    logger.info(`Server running at http://localhost:${app.get("port")} in ${app.get("env")}`);
});