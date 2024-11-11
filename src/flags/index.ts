import { createClient } from '@vercel/edge-config';
const firstConfig = createClient(process.env.EDGE_CONFIG!);

export async function getFeatureFlag() {
    return await firstConfig.get('password-update')
}
