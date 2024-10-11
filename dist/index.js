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
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Key');
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Middleware
app.use(body_parser_1.default.json());
// Webhook route
app.post('/webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const webhookData = req.body;
    console.log('Received webhook data:', webhookData);
    // Process the webhook data here
    // For example, you could insert the data into a Supabase table
    try {
        const { data, error } = yield supabase
            .from('webhook_logs')
            .insert({ payload: webhookData });
        if (error)
            throw error;
        console.log('Webhook data inserted:', data);
        res.status(200).json({ message: 'Webhook received and processed successfully' });
    }
    catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ message: 'Error processing webhook' });
    }
}));
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
