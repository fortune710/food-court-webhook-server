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
exports.client = void 0;
const redis_1 = require("redis");
exports.client = (0, redis_1.createClient)({
    url: "redis://default:IB4Ar175FzoPjRfuWsrjwAWY3qJYd09u@redis-11870.c283.us-east-1-4.ec2.redns.redis-cloud.com:11870"
});
exports.client.on('error', err => console.log('Redis Client Error', err));
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        yield exports.client.connect();
    });
}
connect();
