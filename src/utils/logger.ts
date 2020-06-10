/**
 * Setup the winston logger.
 *
 * Documentation: https://github.com/winstonjs/winston
 */
import { createLogger, format, transports, Logger } from 'winston';
import { FileTransportInstance, ConsoleTransportInstance } from 'winston/lib/winston/transports';

class MyLogger {
    public _logger: Logger;
    private File: FileTransportInstance;
    private Console: ConsoleTransportInstance;
    private constructor() {
        this._logger = createLogger({
            level: "info",
        });;
        this.File = transports.File;
        this.Console = transports.Console;
        this.configLogger("production");
    }

    private static _instance: MyLogger;
    public static get Instance(): MyLogger {
        if (!this._instance) {
            this._instance = new MyLogger();
        }
        return this._instance;
    }

    /**
     * For production write to all logs with level `info` and below
     * to `combined.log. Write all logs error (and below) to `error.log`.
     * For development, print to the console.
     */
    private configLogger(node_env: string) {
        if (process.env.NODE_ENV === node_env) {

            const fileFormat = format.combine(
                format.timestamp(),
                format.json(),
            );
            const errTransport = new this.File({
                filename: './logs/error.log',
                format: fileFormat,
                level: 'error',
            });
            const infoTransport = new this.File({
                filename: './logs/combined.log',
                format: fileFormat,
            });
            this._logger.add(errTransport);
            this._logger.add(infoTransport);

        } else {
            const errorStackFormat = format((info) => {
                if (info.stack) {
                    console.log(info.stack);
                    return false;
                }
                return info;
            });
            const consoleTransport = new this.Console({
                format: format.combine(
                    format.colorize(),
                    format.simple(),
                    errorStackFormat(),
                ),
            });
            this._logger.add(consoleTransport);
        }
    }
}

export default MyLogger.Instance._logger;
