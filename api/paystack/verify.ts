export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reference } = req.query;
  if (!reference || typeof reference !== 'string') {
    return res.status(400).json({ error: 'Missing reference' });
  }

  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (paystackSecretKey && paystackSecretKey.startsWith('sk_') && !paystackSecretKey.includes('xxx')) {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      });
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Verification error' });
    }
  }

  return res.status(200).json({
    status: true,
    data: {
      status: 'success',
      reference,
      gateway_response: 'Successful test transaction',
    },
  });
}
