import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  const siteUrl = process.env.VITE_SITE_URL || 'https://princelystech.ng';

  try {
    const { customerName, customerEmail, customerPhone, items, deliveryAddress, deliveryCity, deliveryState } = req.body;

    if (!customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid checkout data' });
    }

    // Generate unique reference
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const reference = `PT-${dateStr}-${rand}`;

    // Calculate total from items
    let subtotal = 0;
    for (const it of items) {
      subtotal += (it.unitPrice || 0) * (it.quantity || 1);
    }
    const deliveryFee = subtotal >= 60000 ? 0 : 2500;
    const total = subtotal + deliveryFee;

    if (paystackSecretKey && paystackSecretKey.startsWith('sk_') && !paystackSecretKey.includes('xxx')) {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: Math.round(total * 100),
          reference,
          callback_url: `${siteUrl}/order-success/${reference}`,
          metadata: {
            customer_name: customerName,
            customer_phone: customerPhone,
            delivery_address: `${deliveryAddress}, ${deliveryCity}, ${deliveryState}`,
          },
        }),
      });

      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(200).json({
      status: true,
      message: 'Test mode authorization',
      data: {
        authorization_url: `/order-success/${reference}?simulated=true`,
        access_code: 'TEST_ACCESS_CODE',
        reference,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
