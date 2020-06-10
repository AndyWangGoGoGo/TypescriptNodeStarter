import SMSClient from "@alicloud/sms-sdk";
import { ISMS } from "./isms";
import { Configs } from "./configs";

export class SMS implements ISMS {
    SendSMS(phoneNumbers: string, code: string) {
        let result;
        const smsClient = new SMSClient({ accessKeyId: Configs.SMSACCESSKEYID, secretAccessKey: Configs.SMSSECRETACCESSKEY });
        const smsOptions = {
            RegionId: "cn-hangzhou",
            PhoneNumbers: phoneNumbers,
            SignName: Configs.SMSSIGNNAME,
            TemplateCode: Configs.SMSTEMPLATECODE,
            TemplateParam: "{\"code\":\""+ code +"\"}",
            SmsUpExtendCode: "90999",
            OutId: "abcdefgh"
        }

        return new Promise((resolve, reject) => {
            smsClient.sendSMS(smsOptions)
                .then(res => {
                    result = res;
                })
                .then(() => {
                    if (result.Code === "OK") {
                        resolve(result);
                    } else {
                        reject(result);
                    }
                })
                .catch((err)=>{
                    reject(err);
                });
        });
    }
}
