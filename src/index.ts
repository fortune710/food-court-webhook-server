import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(bodyParser.json());

// Webhook route
app.post('/webhook', async (req: Request, res: Response) => {
  const webhookData = req.body;
  console.log('Received webhook data:', webhookData);

  // Process the webhook data here
  // For example, you could insert the data into a Supabase table
  try {
    const { data, error } = await supabase
      .from('webhook_logs')
      .insert({ payload: webhookData });

    if (error) throw error;

    console.log('Webhook data inserted:', data);
    res.status(200).json({ message: 'Webhook received and processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Error processing webhook' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});