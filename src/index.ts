import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { createOrder, getCustomerEmailFromDB } from './supabase';
import { getFeatureFlag } from './flags';
import { sendEmailNotifcation } from './mail/send';
import { SupabaseWebhookPayload, WebhookOrderInformation } from './types';
import { getCustomerEmail, setCustomerEmail } from './redis/customer-email';
import { registerDevice, sendNotification } from './notifications';

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
  const record: WebhookOrderInformation = data.record;

  let customerEmail = await getCustomerEmail(record.user_id);

  if (!customerEmail) {
    customerEmail = await getCustomerEmailFromDB(record.user_id);
    await setCustomerEmail(record.user_id, customerEmail!);
  }

  switch (data.type) {
    case "UPDATE":
      await sendEmailNotifcation(0, record.customer_name, customerEmail!)
      break;

    case "INSERT":
      await sendEmailNotifcation(0, record.customer_name, customerEmail!)
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

app.post('/notifications/order', async (req: Request, res: Response) => {
  const payload: SupabaseWebhookPayload = req.body;
  const record: WebhookOrderInformation = payload.record;

  try {
    const recipient = record.assigned_staff;
    const title = "New Order Placed"
    const body = `${record.customer_name} just placed an order. Respond to it now!`
    await sendNotification(recipient, title, body, {})

    return res.status(200).json({
      data: null,
      success: true,
      message: "Notifications sent successfully"
    })
  } catch (error: any) {
    return res.status(500).json({
      data: null,
      success: false,
      message: error.message || "Notifications could not be sent"
    })
  }

})

app.post('/device/register', async (req: Request, res: Response) => {
  const { token, userId, platform } = req.body;

  if (!token || !userId || !platform) {
    return res.status(400).json({
      data: null,
      message: "token, userId, or platform is missing from request body",
      success: false
    })
  }

  try {
    await registerDevice(token, userId, platform)
    return res.status(500).json({
      data: null,
      message: "Device registered successfully",
      success: true
    })
  } catch (err: any) {
    return res.status(500).json({
      data: null,
      message: err.message,
      success: false
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