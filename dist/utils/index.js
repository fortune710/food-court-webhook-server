"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMetadata = parseMetadata;
exports.groupCartItemsByRestaurant = groupCartItemsByRestaurant;
function parseMetadata(data) {
    return {
        user_id: data.user_id,
        customer_name: data.customer_name,
        cart: data.cart.map((item) => ({
            id: Number(item.id),
            menu_item_id: Number(item.menu_item_id),
            quantity: Number(item.quantity),
            menu_items: Object.assign(Object.assign({}, item.menu_items), { price: Number(item.menu_items.price), description: item.menu_items.description || "" })
        }))
    };
}
function groupCartItemsByRestaurant(userCart) {
    const groupedOrders = {};
    userCart.cart.forEach((item) => {
        const restaurantId = item.menu_items.resturant_id;
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
        if (item.menu_items.price !== undefined) {
            groupedOrders[restaurantId].total_amount +=
                (item.quantity * item.menu_items.price);
        }
    });
    return Object.values(groupedOrders);
}
