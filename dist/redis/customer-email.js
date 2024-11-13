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
exports.getCustomerEmail = getCustomerEmail;
exports.setCustomerEmail = setCustomerEmail;
const _1 = require(".");
function getCustomerEmail(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const email = yield _1.client.get("email:" + userId);
        return email;
    });
}
function setCustomerEmail(userId, email) {
    return __awaiter(this, void 0, void 0, function* () {
        const TTL_IN_SECONDS = 1 * 60 * 60;
        yield _1.client.set("email:" + userId, email, {
            EX: TTL_IN_SECONDS
        });
    });
}
