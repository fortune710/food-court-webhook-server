export interface CartItem {
    id: number,
    menu_item_id: number,
    addon_name?: string,
    addon_price?: number,
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

export interface SupabaseWebhookPayload {
    type: "INSERT" | "UPDATE",
    record: any,
}

export interface WebhookOrderInformation {
    user_id: string,
    customer_name: string,
    status: number,
    assigned_staff: string
}

export enum SupabaseTables {
    Orders = "orders",
    OrderItems = "order_items",
    CartItems = "cart_items",
    MenuItems = "menu_items",
    NotificationTokens = "notification-tokens"
}