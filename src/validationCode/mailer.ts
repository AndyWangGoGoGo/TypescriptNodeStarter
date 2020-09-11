import { IMailer } from "./imailer";
import NodeMailer from "nodemailer";
import { Configs } from "./configs";

export class Mailer implements IMailer {
    private _fromMail: string;
    private _transporter;

    /**
     * Send Email
     * @description Send email to target email
     * @param {string} fromMail                    Sender address
     * @param {string} senderHost                  Host is the hostname or IP address to connect to (defaults to ‘localhost’)
     * @param {string} senderPort                  Port is the port to connect to (defaults to 587 if is secure is false or 465 if true)
     * @param {string} authUser                    Generated ethereal user
     * @param {string} authPass                    Generated ethereal password
     */
    constructor() {
        this._fromMail = Configs.SENDGRID_USER;
        let senderSecure = false;

        //true for 465, false for other ports
        //if true the connection will use TLS when connecting to server. If false (the default) then TLS is used if server supports the STARTTLS
        if (Configs.SENDGRID_PORT === 465) {
            senderSecure = true;
        }
        this._transporter = NodeMailer.createTransport({
            host: Configs.SENDGRID_HOST,
            port: Configs.SENDGRID_PORT,
            secure: senderSecure,
            auth: {
                user: Configs.SENDGRID_USER,
                pass: Configs.SENDGRID_PASSWORD
            }
        });
    }

    sendCode = async (mail: string, code: string): Promise<unknown> => {
        const mailOptions = {
            to: mail,
            from: this._fromMail,
            subject: "Account email verification code",
            text: `Hello! \n\n To ensure that it is your own operation，please enter the verification code below in the mail verification Code input box：${code} \n Please do not disclose the verification code you have received to anyone. \n\n Best wishes for you!\n ****`
        };

        return new Promise((resolve, reject) => {
            this._transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        })
    }

    sendResetPasswordEmail = async (mail: string): Promise<unknown> => {
        const mailOptions = {
            to: mail,
            from: this._fromMail,
            subject: "Your password has been changed",
            text: `Hello,\n\nThis is a confirmation that the password for your account ${mail} has just been changed.\n`
        };

        return new Promise((resolve, reject) => {
            this._transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        })
    }

    sendForgotPasswordEmail = async (host: string, token: string, mail: string): Promise<unknown> => {
        const mailOptions = {
            to: mail,
            from: this._fromMail,
            subject: "Reset your password on Hackathon Starter",
            text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
               Please click on the following link, or paste this into your browser to complete the process:\n\n
               http://${host}/reset/${token}\n\n
               If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        return new Promise((resolve, reject) => {
            this._transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        })
    }
}