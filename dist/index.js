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
