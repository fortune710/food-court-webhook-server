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

async function getHighestPrepTime(menuItemIds: number[]) {
    // Early return if no ids provided
    if (!menuItemIds.length) return 0;
    
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('preparation_time')
        .in('id', menuItemIds);
        
      if (error) return 10;
      
      // Convert preparation times to minutes (numbers)
      const prepTimes = data.map(item => {
        // Extract the number from strings like "15 mins"
        const minutes = parseInt(item.preparation_time.split(' ')[0]);
        return isNaN(minutes) ? 10 : minutes;
      });
      
      // Return the highest prep time
      return Math.max(...prepTimes);
      
    } catch (error) {
      console.error('Error fetching preparation times:', error);
      return 10;
    }
}

export async function createOrder(data: Metadata) {
    const userCart = parseMetadata(data);
    const orders = groupCartItemsByRestaurant(userCart);
    

    await Promise.all(
        orders.map(async (order) => {
            const menuItemIds = order.order_items.map((item) => item.menu_item_id!);
            const highestPrepTime = await getHighestPrepTime(menuItemIds);

            const { data } = await supabase.from(SupabaseTables.Orders).upsert({
                restaurant_id: order.restaurant_id,
                total_amount: order.total_amount,
                notes: "",
                user_paid: false,
                customer_name: order.customer_name,
                user_id: order.user_id,
                preparation_time: highestPrepTime
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
