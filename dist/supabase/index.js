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
exports.getCustomerEmailFromDB = getCustomerEmailFromDB;
exports.getNotificationToken = getNotificationToken;
exports.checkNotificationTokenExists = checkNotificationTokenExists;
exports.createNotificationToken = createNotificationToken;
exports.updateNotificationToken = updateNotificationToken;
const types_1 = require("../types");
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const utils_1 = require("../utils");
const staff_1 = require("../redis/staff");
dotenv_1.default.config();
// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Key');
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
function getHighestPrepTime(menuItemIds) {
    return __awaiter(this, void 0, void 0, function* () {
        // Early return if no ids provided
        if (!menuItemIds.length)
            return 0;
        try {
            const { data, error } = yield supabase
                .from('menu_items')
                .select('preparation_time')
                .in('id', menuItemIds);
            if (error)
                return 10;
            // Convert preparation times to minutes (numbers)
            const prepTimes = data.map(item => {
                // Extract the number from strings like "15 mins"
                const minutes = parseInt(item.preparation_time.split(' ')[0]);
                return isNaN(minutes) ? 10 : minutes;
            });
            // Return the highest prep time
            return Math.max(...prepTimes);
        }
        catch (error) {
            console.error('Error fetching preparation times:', error);
            return 10;
        }
    });
}
function getRestaurantStaff(restaurantId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase
                .from('restaurant-staff')
                .select('staff_id')
                .eq('restaurant_id', restaurantId);
            if (error)
                return [];
            // Convert preparation times to minutes (numbers)
            return data.map(({ staff_id }) => staff_id);
        }
        catch (error) {
            return [];
        }
    });
}
function isStaffOnline(staffId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase.from('restaurant-staff')
                .select("is_online")
                .eq("staff_id", staffId)
                .single();
            if (error)
                return false;
            return data.is_online;
        }
        catch (_a) {
            return false;
        }
    });
}
function createOrder(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const userCart = (0, utils_1.parseMetadata)(data);
        const orders = (0, utils_1.groupCartItemsByRestaurant)(userCart);
        yield Promise.all(orders.map((order) => __awaiter(this, void 0, void 0, function* () {
            const menuItemIds = order.order_items.map((item) => item.menu_item_id);
            const highestPrepTime = yield getHighestPrepTime(menuItemIds);
            const exists = yield (0, staff_1.restaurantExists)(order.restaurant_id);
            if (!exists) {
                const staff = yield getRestaurantStaff(order.restaurant_id);
                yield (0, staff_1.addStaffToQueue)(order.restaurant_id, staff);
            }
            let nextStaff = yield (0, staff_1.getNextStaff)(order.restaurant_id);
            let iterationCount = 0;
            console.log(nextStaff);
            //while loop will repeatedly attempt to get an availale staff for 10 iterations 
            while (true) {
                const isOnline = yield isStaffOnline(nextStaff);
                console.log(isOnline, "online");
                if (!isOnline) {
                    nextStaff = yield (0, staff_1.getNextStaff)(order.restaurant_id);
                    iterationCount += 1;
                    continue;
                }
                else if (iterationCount >= 10) {
                    nextStaff = null;
                    break;
                }
                else {
                    break;
                }
            }
            const { data } = yield supabase.from(types_1.SupabaseTables.Orders).upsert({
                restaurant_id: order.restaurant_id,
                total_amount: order.total_amount,
                notes: "",
                user_paid: false,
                customer_name: order.customer_name,
                user_id: order.user_id,
                preparation_time: highestPrepTime,
                assigned_staff: nextStaff,
            }).select();
            const orderData = data[0];
            yield supabase.from(types_1.SupabaseTables.OrderItems).insert(order.order_items.map((item) => ({
                order_id: orderData.id,
                menu_item_id: item.menu_item_id,
                quantity: item.quantity,
                addon_name: item === null || item === void 0 ? void 0 : item.addon_name,
                addon_price: item === null || item === void 0 ? void 0 : item.addon_price,
            })));
        })));
        const menuItemIds = orders.map((order) => {
            return order.order_items.map((item) => item.menu_item_id);
        }).flat();
        const { data: menuItem } = yield supabase.from(types_1.SupabaseTables.MenuItems)
            .select('id, quantity')
            .in('id', menuItemIds);
        const stockUpdatePromises = menuItem === null || menuItem === void 0 ? void 0 : menuItem.map((item) => __awaiter(this, void 0, void 0, function* () {
            yield supabase.from(types_1.SupabaseTables.MenuItems)
                .update({ quantity: item.quantity - 1 })
                .eq('id', item.id);
            return true;
        }));
        return yield Promise.all([
            yield supabase.from(types_1.SupabaseTables.CartItems)
                .delete()
                .eq('user_id', data.user_id),
            yield Promise.all(stockUpdatePromises)
        ]);
    });
}
function getCustomerEmailFromDB(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield supabase.from("profiles").select("email").eq("id", userId).single();
        return data === null || data === void 0 ? void 0 : data.email;
    });
}
function getNotificationToken(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data: token, error } = yield supabase.from(types_1.SupabaseTables.NotificationTokens)
            .select("*").eq("user_id", userId).single();
        if (error)
            throw new Error(error.message);
        return token;
    });
}
function checkNotificationTokenExists(userId, newToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data: token, error } = yield supabase.from(types_1.SupabaseTables.NotificationTokens)
            .select("*").eq("user_id", userId).single();
        if (error)
            return { exists: false, changed: false };
        if (token.expo !== newToken)
            return { exists: true, changed: true };
        return { exists: true, changed: false };
    });
}
function createNotificationToken(userId, notificationToken, platform) {
    return __awaiter(this, void 0, void 0, function* () {
        const { error } = yield supabase.from(types_1.SupabaseTables.NotificationTokens)
            .upsert({
            user_id: userId,
            expo: notificationToken,
            apn: platform === "ios" ? notificationToken : null,
            fcm: platform !== "ios" ? notificationToken : null
        });
        if (error)
            throw new Error(error.message);
        return;
    });
}
function updateNotificationToken(userId, notificationToken, platform) {
    return __awaiter(this, void 0, void 0, function* () {
        const { error } = yield supabase.from(types_1.SupabaseTables.NotificationTokens)
            .update({
            user_id: userId,
            expo: notificationToken,
            apn: platform === "ios" ? notificationToken : null,
            fcm: platform !== "ios" ? notificationToken : null
        })
            .eq("user_id", userId);
        if (error)
            throw new Error(error.message);
        return;
    });
}
