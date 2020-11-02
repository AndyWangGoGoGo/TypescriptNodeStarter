import { App } from "./app";
import logger from "./utils/logger";
import { MONGODB_URI, PORT } from "./utils/dotENV";

const application = new App(MONGODB_URI);

application.app.listen(PORT || 3001, () => {
    logger.info(`Server running at http://localhost:${PORT || 3001} in ${application.app.get("env")}`);
});