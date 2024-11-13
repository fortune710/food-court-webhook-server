import { client } from ".";

export async function getCustomerEmail(userId: string) {
    const email = await client.get("email:" + userId)
    return email
}

export async function setCustomerEmail(userId: string, email: string) {
    const TTL_IN_SECONDS = 1 * 60 * 60;
    await client.set("email:" + userId, email, {
        EX: TTL_IN_SECONDS
    })
}