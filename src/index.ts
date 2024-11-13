import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { createOrder, getCustomerEmailFromDB } from './supabase';
import { getFeatureFlag } from './flags';
import { sendEmailNotifcation } from './mail/send';
import { SupabaseWebhookPayload } from './types';
import { getCustomerEmail, setCustomerEmail } from './redis/customer-email';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

app.get('/', (_: Request, res: Response) => {
  return res.status(200).json({
    message: 'Server is up and running, webhooks processed on /webhook endpoint'
  })
})

app.get('/test', (_: Request, res: Response) => {
  return res.status(200).json({
    message: 'Server is up and running, webhooks processed on /webhook endpoint'
  })
})

app.post('/mail', async (req: Request, res: Response) => {
  const data: SupabaseWebhookPayload = req.body;
  let customerEmail = await getCustomerEmail(data.record.user_id);

  if (!customerEmail) {
    customerEmail = await getCustomerEmailFromDB(data.record.user_id);
    await setCustomerEmail(data.record.user_id, customerEmail!);
  }

  switch (data.type) {
    case "UPDATE":
      await sendEmailNotifcation(0, data.record.customer_name, customerEmail!)
      break;

    case "INSERT":
      await sendEmailNotifcation(0, data.record.customer_name, customerEmail!)
      break;

    default:
      break;
  }
  return res.status(200).json({
    message: 'Server is up and running, webhooks processed on /webhook endpoint'
  })
})

app.get('/flag', async (_: Request, res: Response) => {
  try {
    const flagOn = await getFeatureFlag();
  
    return res.status(200).json({
      message: 'Feature flag gotten',
      data: flagOn
    })
  } catch {
    return res.status(200).json({
      message: 'Feature flag not gotten',
      data: false
    })
  }
})

// Webhook route
app.post('/webhook', async (req: Request, res: Response) => {
  const webhookData = req.body;
  const event: "charge.success" = req.body.event;

  try {
    switch(event) {
      case "charge.success":
        await createOrder(webhookData.data.metadata)
        return res.status(201).json({ message: 'Webhook received and processed successfully' });
      default:
        return res.status(200).json({ message: 'Webhook event not supported yet' })
    }
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      error: e, message: "Internal Server Error"
    })
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});