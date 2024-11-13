import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';

// Interface for SMTP configuration
interface SmtpConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
}

// Interface for email attachments
interface EmailAttachment {
    filename: string;
    content: string | Buffer;
    contentType?: string;
    path?: string;
}

// Interface for email details
interface EmailDetails {
    from: string;
    to: string | string[];
    subject: string;
    text: string;
    html?: string;
    attachments?: EmailAttachment[];
}

// Interface for the function response
interface EmailResponse {
    success: boolean;
    messageId?: string;
    response?: string;
    error?: string;
}

/**
 * Sends an email using nodemailer
 * @param {SmtpConfig} config - SMTP server configuration
 * @param {EmailDetails} emailDetails - Email content and recipients
 * @returns {Promise<EmailResponse>} Result of the email sending operation
 */
async function sendEmail(
    config: SmtpConfig,
    emailDetails: Omit<EmailDetails, 'from'>
): Promise<EmailResponse> {
    try {
        // Create transporter with SMTP configuration
        const transporter: Transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: true, // true for 465, false for other ports
            auth: {
                user: config.user,
                pass: config.pass,
            },
            
        });

        // Send email
        const info: SentMessageInfo = await transporter.sendMail({
            from: '"SC: FoodCourt" <sc-foodcourt@startupcampushq.com>',
            to: emailDetails.to,
            subject: emailDetails.subject,
            text: emailDetails.text,
            html: emailDetails.html,
            attachments: emailDetails.attachments
        });

        console.log("email sent")

        return {
            success: true,
            messageId: info.messageId,
            response: info.response
        };

    } catch (error) {
        console.log(error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}



const emailDetails: EmailDetails = {
    from: '"SC: FoodCourt" <sc-foodcourt@startupcampushq.com>',
    to: "recipient@example.com",
    subject: "Hello from Nodemailer",
    text: "This is a test email sent using Nodemailer",
    html: "<b>This is a test email sent using Nodemailer</b>",
    attachments: [
        {
            filename: 'test.txt',
            content: 'Hello World!'
        }
    ]
};

// Using the function
// sendEmail(config, emailDetails)
//     .then((result: EmailResponse) => console.log(result))
//     .catch((error: unknown) => console.error(error));

export { sendEmail, SmtpConfig, EmailDetails, EmailResponse, EmailAttachment };