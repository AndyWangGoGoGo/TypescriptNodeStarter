import { IMailer } from "./imailer";
import NodeMailer from "nodemailer";
import { Configs } from "./configs";

export class Mailer implements IMailer
{
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
    constructor()
    {
        this._fromMail = Configs.SENDGRID_USER;
        let senderSecure = false;
        
        //true for 465, false for other ports
        //if true the connection will use TLS when connecting to server. If false (the default) then TLS is used if server supports the STARTTLS
        if(Configs.SENDGRID_PORT === 465)
        {
            senderSecure = true;
        }
        this._transporter = NodeMailer.createTransport({
            host:Configs.SENDGRID_HOST,
            port:Configs.SENDGRID_PORT,
            secure:senderSecure,
            auth: {
                user: Configs.SENDGRID_USER,
                pass: Configs.SENDGRID_PASSWORD
            }
        });
    }

    sendCode = async (mail: string, code: string): Promise<unknown>=>{
        const mailOptions = {
            to: mail,
            from: this._fromMail,
            subject: "账号邮件验证码",
            text: `您好！\n\n为确保是您本人操作，请在邮件验证码输入框输入下方验证码：${code} \n请勿向任何人泄露您收到的验证码。\n\n此致\n瑞木`
        };
        console.log(`to:${mail},code:${code},from:${this._fromMail}`);
        return new Promise((resolve,reject)=>{
            this._transporter.sendMail(mailOptions, (err) => {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    resolve();
                }
            });
        })
    }

    sendResetPasswordEmail = async (mail: string): Promise<unknown>=>{
        const mailOptions = {
            to: mail,
            from: this._fromMail,
            subject: "Your password has been changed",
            text: `Hello,\n\nThis is a confirmation that the password for your account ${mail} has just been changed.\n`
        };

        return new Promise((resolve,reject)=>{
            this._transporter.sendMail(mailOptions, (err) => {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    resolve();
                }
            });
        })
    }

    sendForgotPasswordEmail = async (host: string, token: string, mail: string): Promise<unknown>=>{
        const mailOptions = {
            to: mail,
            from: this._fromMail,
            subject: "Reset your password on Hackathon Starter",
            text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
               Please click on the following link, or paste this into your browser to complete the process:\n\n
               http://${host}/reset/${token}\n\n
               If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        return new Promise((resolve,reject)=>{
            this._transporter.sendMail(mailOptions, (err) => {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    resolve();
                }
            });
        })
    }
}