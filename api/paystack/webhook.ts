import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    return res.status(400).send('Webhook secret not configured');
  }

  const signature = req.headers['x-paystack-signature'];
  if (!signature || typeof signature !== 'string') {
    return res.status(400).send('Missing signature');
  }

  const hash = crypto
    .createHmac('sha512', paystackSecretKey)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== signature) {
    return res.status(400).send('Invalid signature');
  }

  // Handle event
  const event = req.body;
  if (event.event === 'charge.success') {
    console.log(`Charge successful for reference: ${event.data?.reference}`);
  }

  return res.status(200).send('OK');
}
