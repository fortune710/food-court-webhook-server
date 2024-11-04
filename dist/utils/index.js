"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMetadata = parseMetadata;
exports.groupCartItemsByRestaurant = groupCartItemsByRestaurant;
function parseMetadata(data) {
    return {
        user_id: data.user_id,
        customer_name: data.customer_name,
        cart: data.cart.map((item) => {
            var _a, _b;
            return ({
                id: Number(item.id),
                menu_item_id: Number(item.menu_item_id),
                quantity: Number(item.quantity),
                menu_item: Object.assign(Object.assign({}, item.menu_item), { price: Number((_a = item.menu_item) === null || _a === void 0 ? void 0 : _a.price), description: ((_b = item.menu_item) === null || _b === void 0 ? void 0 : _b.description) || "" }),
                addon_name: (item === null || item === void 0 ? void 0 : item.addon_name) || "",
                addon_price: (item === null || item === void 0 ? void 0 : item.addon_price) || 0,
            });
        })
    };
}
function groupCartItemsByRestaurant(userCart) {
    const groupedOrders = {};
    userCart.cart.forEach((item) => {
        const restaurantId = item.menu_item.resturant_id;
        if (!groupedOrders[restaurantId]) {
            groupedOrders[restaurantId] = {
                total_amount: 0,
                restaurant_id: restaurantId,
                user_id: userCart.user_id,
                customer_name: userCart.customer_name, // This will remain empty as we don't have customer name data
                order_items: [],
            };
        }
        groupedOrders[restaurantId].order_items.push(item);
        // Calculate total amount if price is available
        if (item.menu_item.price !== undefined) {
            groupedOrders[restaurantId].total_amount +=
                (item.quantity * item.menu_item.price);
        }
    });
    return Object.values(groupedOrders);
}
