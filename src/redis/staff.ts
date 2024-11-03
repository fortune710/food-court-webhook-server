import { client } from ".";

export async function addStaffToQueue(restaurantId: number, staffIds: string[]) {
    for (let staffId of staffIds) {
        await client.rPush(String(restaurantId), staffId)
    }
}

export async function getNextStaff(restaurantId: number) {
    const staffId = await client.lPop(String(restaurantId));
    await client.rPush(String(restaurantId), staffId!);
    return staffId!;
}

export async function restaurantExists(restaurantId: number) {
    const length = await client.lLen(String(restaurantId));
    return length > 0;
}