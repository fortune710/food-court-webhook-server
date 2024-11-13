import { SmtpConfig } from "../mail";

// Example usage with type annotations
export const config: SmtpConfig = {
    host: "smtp.zoho.com",
    port: 465,
    user: "sc-foodcourt@startupcampushq.com",
    pass: process.env.MAIL_PASSWORD!
};