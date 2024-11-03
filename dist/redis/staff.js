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
exports.addStaffToQueue = addStaffToQueue;
exports.getNextStaff = getNextStaff;
exports.restaurantExists = restaurantExists;
const _1 = require(".");
function addStaffToQueue(restaurantId, staffIds) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let staffId of staffIds) {
            yield _1.client.rPush(String(restaurantId), staffId);
        }
    });
}
function getNextStaff(restaurantId) {
    return __awaiter(this, void 0, void 0, function* () {
        const staffId = yield _1.client.lPop(String(restaurantId));
        yield _1.client.rPush(String(restaurantId), staffId);
        return staffId;
    });
}
function restaurantExists(restaurantId) {
    return __awaiter(this, void 0, void 0, function* () {
        const length = yield _1.client.lLen(String(restaurantId));
        return length > 0;
    });
}
