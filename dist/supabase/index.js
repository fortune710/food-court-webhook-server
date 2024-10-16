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
exports.createOrder = createOrder;
const types_1 = require("../types");
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const utils_1 = require("../utils");
dotenv_1.default.config();
// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Key');
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
function createOrder(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const userCart = (0, utils_1.parseMetadata)(data);
        const orders = (0, utils_1.groupCartItemsByRestaurant)(userCart);
        return yield Promise.all(orders.map((order) => __awaiter(this, void 0, void 0, function* () {
            const { data } = yield supabase.from(types_1.SupabaseTables.Orders).upsert({
                restaurant_id: order.restaurant_id,
                total_amount: order.total_amount,
                notes: "",
                user_paid: false,
                customer_name: order.customer_name,
                user_id: order.user_id
            }).select();
            const orderData = data[0];
            yield supabase.from(types_1.SupabaseTables.OrderItems).insert(order.order_items.map((item) => ({
                order_id: orderData.id,
                menu_item_id: item.menu_item_id,
                quantity: item.quantity,
            })));
        })));
    });
}
