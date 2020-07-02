import app from "./app";
import logger from "./utils/logger";

app.listen(process.env.PORT || 3001, () => {
    logger.info(`Server running at http://localhost:${process.env.PORT} in ${process.env.NODE_ENV}`);
});