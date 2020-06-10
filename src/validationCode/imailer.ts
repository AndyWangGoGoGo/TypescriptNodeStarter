// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IMailer
{
    sendCode(mail: string, code: string): Promise<unknown>;
    sendResetPasswordEmail(mail: string): Promise<unknown>;
    sendForgotPasswordEmail(host: string,token: string, mail: string): Promise<unknown>;
}