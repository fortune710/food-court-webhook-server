export interface CartItem {
    id: number,
    menu_item_id: number,
    menu_item: {
        description: string|null,
        name: string,
        price: number,
        resturant_id: number
    },
    quantity: number
}

export interface Metadata {
    user_id: string,
    customer_name: string,
    cart: CartItem[]
}

export interface Order {
    total_amount: number,
    restaurant_id: number,
    user_id: string,
    customer_name: string,
    order_items: CartItem[],
}


export enum SupabaseTables {
    Orders = "orders",
    OrderItems = "order_items"
}