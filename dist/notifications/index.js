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
exports.sendNotification = sendNotification;
exports.registerDevice = registerDevice;
const expo_server_sdk_1 = require("expo-server-sdk");
const supabase_1 = require("../supabase");
const expo = new expo_server_sdk_1.Expo();
// Send Expo Push Notification
function sendExpoNotification(token, title, body, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const messages = [{
                to: token,
                sound: 'default',
                title,
                body,
                data
            }];
        try {
            yield expo.sendPushNotificationsAsync(messages);
        }
        catch (error) {
            console.error('Expo notification error:', error);
        }
    });
}
function sendFcmNotification(token, title, body, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return;
    });
}
function sendApnNotification(token, title, body, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return;
    });
}
function sendNotification(userId, title, body, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield (0, supabase_1.getNotificationToken)(userId);
        //Will be removed once Firebase Cloud Messaging and APN are setup for mobile
        if (token.expo) {
            yield sendExpoNotification(token.expo, title, body, data);
        }
        if (token.fcm) {
            yield sendFcmNotification(token.fcm, title, body, data);
        }
        if (token.apn) {
            yield sendApnNotification(token.apn, title, body, data);
        }
    });
}
function registerDevice(token, userId, platform) {
    return __awaiter(this, void 0, void 0, function* () {
        const { exists, changed } = yield (0, supabase_1.checkNotificationTokenExists)(userId, token);
        if (exists)
            return;
        if (changed) {
            return yield (0, supabase_1.updateNotificationToken)(userId, token, platform);
        }
        return yield (0, supabase_1.createNotificationToken)(userId, token, platform);
    });
}
