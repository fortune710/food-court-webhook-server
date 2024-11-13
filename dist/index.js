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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const supabase_1 = require("./supabase");
const flags_1 = require("./flags");
const send_1 = require("./mail/send");
const customer_email_1 = require("./redis/customer-email");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use(body_parser_1.default.json());
app.get('/', (_, res) => {
    return res.status(200).json({
        message: 'Server is up and running, webhooks processed on /webhook endpoint'
    });
});
app.get('/test', (_, res) => {
    return res.status(200).json({
        message: 'Server is up and running, webhooks processed on /webhook endpoint'
    });
});
app.post('/mail', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    let customerEmail = yield (0, customer_email_1.getCustomerEmail)(data.record.user_id);
    if (!customerEmail) {
        customerEmail = yield (0, supabase_1.getCustomerEmailFromDB)(data.record.user_id);
        yield (0, customer_email_1.setCustomerEmail)(data.record.user_id, customerEmail);
    }
    switch (data.type) {
        case "UPDATE":
            yield (0, send_1.sendEmailNotifcation)(0, data.record.customer_name, customerEmail);
            break;
        case "INSERT":
            yield (0, send_1.sendEmailNotifcation)(0, data.record.customer_name, customerEmail);
            break;
        default:
            break;
    }
    return res.status(200).json({
        message: 'Server is up and running, webhooks processed on /webhook endpoint'
    });
}));
app.get('/flag', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const flagOn = yield (0, flags_1.getFeatureFlag)();
        return res.status(200).json({
            message: 'Feature flag gotten',
            data: flagOn
        });
    }
    catch (_a) {
        return res.status(200).json({
            message: 'Feature flag not gotten',
            data: false
        });
    }
}));
// Webhook route
app.post('/webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const webhookData = req.body;
    const event = req.body.event;
    try {
        switch (event) {
            case "charge.success":
                yield (0, supabase_1.createOrder)(webhookData.data.metadata);
                return res.status(201).json({ message: 'Webhook received and processed successfully' });
            default:
                return res.status(200).json({ message: 'Webhook event not supported yet' });
        }
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            error: e, message: "Internal Server Error"
        });
    }
}));
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
