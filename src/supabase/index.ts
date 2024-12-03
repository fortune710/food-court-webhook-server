import { Metadata, SupabaseTables } from "../types";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { groupCartItemsByRestaurant, parseMetadata } from "../utils";
import { addStaffToQueue, getNextStaff, restaurantExists } from "../redis/staff";

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

async function getRestaurantStaff(restaurantId: number) {
        
  try {
      const { data, error } = await supabase
        .from('restaurant-staff')
        .select('staff_id')
        .eq('restaurant_id', restaurantId);
        
      if (error) return [];
      
      // Convert preparation times to minutes (numbers)
      return data.map(({ staff_id }) => staff_id);
      
  } catch (error) {
      return [];
  }
}

async function isStaffOnline(staffId: string) {
  try {
    const { data, error } = await supabase.from('restaurant-staff')
      .select("is_online")
      .eq("staff_id", staffId)
      .single()


    if (error) return false;
    return data.is_online;

  } catch {
    return false;
  }
}

export async function createOrder(data: Metadata) {
    const userCart = parseMetadata(data);
    const orders = groupCartItemsByRestaurant(userCart);
    

    await Promise.all(
        orders.map(async (order) => {
            const menuItemIds = order.order_items.map((item) => item.menu_item_id!);
            const highestPrepTime = await getHighestPrepTime(menuItemIds);

            const exists = await restaurantExists(order.restaurant_id);

            if (!exists) {
              const staff = await getRestaurantStaff(order.restaurant_id)!;
              await addStaffToQueue(order.restaurant_id, staff)
            }

            let nextStaff: string | null = await getNextStaff(order.restaurant_id);
            let iterationCount = 0;

            console.log(nextStaff)
            

            //while loop will repeatedly attempt to get an availale staff for 10 iterations 
            while (true) {
              const isOnline = await isStaffOnline(nextStaff!);
              console.log(isOnline, "online")

              if (!isOnline) {
                nextStaff = await getNextStaff(order.restaurant_id);
                iterationCount += 1;
                continue;
              } else if (iterationCount >= 10) {
                nextStaff = null;
                break;
              } else {
                break;
              }
            }

            const { data } = await supabase.from(SupabaseTables.Orders).upsert({
              restaurant_id: order.restaurant_id,
              total_amount: order.total_amount,
              notes: "",
              user_paid: false,
              customer_name: order.customer_name,
              user_id: order.user_id,
              preparation_time: highestPrepTime,
              assigned_staff: nextStaff,
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
                  addon_name: item?.addon_name,
                  addon_price: item?.addon_price,
                }))
            )

            
        })
    )

    const menuItemIds = orders.map((order) => {
      return order.order_items.map((item) => item.menu_item_id)
    }).flat()

    const { data: menuItem } = await supabase.from(SupabaseTables.MenuItems)
      .select('id, quantity')
      .in('id', menuItemIds)
      
    const stockUpdatePromises = menuItem?.map(async (item) => {
      await supabase.from(SupabaseTables.MenuItems)
      .update({ quantity: item.quantity - 1 })
      .eq('id', item.id)

      return true
    })


    return await Promise.all([
      await supabase.from(SupabaseTables.CartItems)
        .delete()
        .eq('user_id', data.user_id),
      await Promise.all(stockUpdatePromises!)
    ])
    

}

export async function getCustomerEmailFromDB(userId: string) {
  const { data } = await supabase.from("profiles").select("email").eq("id", userId).single();
  return data?.email
}
