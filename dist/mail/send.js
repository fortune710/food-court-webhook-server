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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailNotifcation = sendEmailNotifcation;
const _1 = require(".");
const config_1 = require("../utils/config");
function sendEmailNotifcation(status, customerName, email) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (status) {
            case 0:
                return (0, _1.sendEmail)(config_1.config, {
                    to: email,
                    subject: `Hi ${customerName}! Your order has been received`,
                    text: `Hello ${customerName}`
                });
            case 3:
                return (0, _1.sendEmail)(config_1.config, {
                    to: email,
                    subject: `Hi ${customerName}! Your order is ready`,
                    text: `Hello ${customerName}`
                });
            default:
                break;
        }
    });
}
