import { Metadata, SupabaseTables } from "../types";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { groupCartItemsByRestaurant, parseMetadata } from "../utils";

dotenv.config();


// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function createOrder(data: Metadata) {
    const userCart = parseMetadata(data);
    const orders = groupCartItemsByRestaurant(userCart);
    

    await Promise.all(
        orders.map(async (order) => {
            const { data } = await supabase.from(SupabaseTables.Orders).upsert({
                restaurant_id: order.restaurant_id,
                total_amount: order.total_amount,
                notes: "",
                user_paid: false,
                customer_name: order.customer_name,
                user_id: order.user_id
            }).select()
            const orderData = data![0] as {
                id: number,
                total_amount: number,
                restaurant_id: number,
            }
            
            await supabase.from(SupabaseTables.OrderItems).insert(
                order.order_items.map((item) => ({
                    order_id: orderData.id,
                    menu_item_id: item.menu_item_id,
                    quantity: item.quantity,
                }))
            )
        })
    )

    return await supabase.from(SupabaseTables.CartItems)
        .delete()
        .eq('user_id', data.user_id)

}
