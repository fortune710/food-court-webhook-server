import { createClient } from 'redis';

export const client = createClient({
    url: "redis://default:IB4Ar175FzoPjRfuWsrjwAWY3qJYd09u@redis-11870.c283.us-east-1-4.ec2.redns.redis-cloud.com:11870"
});

client.on('error', err => console.log('Redis Client Error', err));

async function connect() {
    await client.connect();
}

connect();