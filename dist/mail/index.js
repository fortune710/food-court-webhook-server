"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
/**
 * Sends an email using nodemailer
 * @param {SmtpConfig} config - SMTP server configuration
 * @param {EmailDetails} emailDetails - Email content and recipients
 * @returns {Promise<EmailResponse>} Result of the email sending operation
 */
function sendEmail(config, emailDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Create transporter with SMTP configuration
            const transporter = nodemailer_1.default.createTransport({
                host: config.host,
                port: config.port,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: config.user,
                    pass: config.pass,
                },
            });
            // Send email
            const info = yield transporter.sendMail({
                from: '"SC: FoodCourt" <sc-foodcourt@startupcampushq.com>',
                to: emailDetails.to,
                subject: emailDetails.subject,
                text: emailDetails.text,
                html: emailDetails.html,
                attachments: emailDetails.attachments
            });
            console.log("email sent");
            return {
                success: true,
                messageId: info.messageId,
                response: info.response
            };
        }
        catch (error) {
            console.log(error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    });
}
const emailDetails = {
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
