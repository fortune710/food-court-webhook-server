import { sendEmail } from ".";
import { config } from "../utils/config";

export async function sendEmailNotifcation(status: number, customerName: string, email: string) {
    switch (status) {
        case 0:
            return sendEmail(config, {
                to: email,
                subject: `Hi ${customerName}! Your order has been received`,
                text: `Hello ${customerName}`
            })

        case 3:
            return sendEmail(config, {
                to: email,
                subject: `Hi ${customerName}! Your order is ready`,
                text: `Hello ${customerName}`
            })
            
        default:
            break;
    }
}