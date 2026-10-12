export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { reference } = req.query || {};
  if (!reference || typeof reference !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing payment reference' });
  }

  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (paystackSecretKey && paystackSecretKey.startsWith('sk_') && !paystackSecretKey.includes('xxx')) {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      });
      const data: any = await response.json();
      const isPaid = data.status && data.data?.status === 'success';

      return res.status(200).json({
        success: isPaid,
        status: data.status,
        data: data.data,
        message: data.message,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Verification error' });
    }
  }

  // Fallback for test mode
  return res.status(200).json({
    success: true,
    status: true,
    isTestMode: true,
    data: {
      status: 'success',
      reference,
      gateway_response: 'Successful test transaction',
    },
  });
}
