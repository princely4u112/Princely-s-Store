export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  const siteUrl = process.env.APP_URL || process.env.VITE_SITE_URL || 'https://princelystech.ng';

  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      orderNotes,
      items,
      reference: clientRef,
      deliveryFee: clientDeliveryFee,
    } = req.body || {};

    if (!customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        status: false,
        error: 'Invalid checkout data. Please ensure your cart has items and email is provided.',
      });
    }

    // Generate unique reference or use client reference
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const reference = clientRef || `PT-${dateStr}-${rand}`;

    // Calculate subtotal & build order items accurately
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const it of items) {
      const unitPrice = Number(it.unitPrice) || 0;
      const quantity = Math.max(1, Number(it.quantity) || 1);
      const itemTotal = unitPrice * quantity;
      subtotal += itemTotal;

      orderItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: it.productId,
        variantId: it.variantId,
        productName: it.productName || 'Gadget Accessory',
        variantName: it.variantName,
        unitPrice,
        quantity,
        totalPrice: itemTotal,
      });
    }

    // Delivery Fee:
    // Respect client deliveryFee (e.g. 0 for nationwide free shipping or custom rate from admin settings)
    let deliveryFee = 0;
    if (clientDeliveryFee !== undefined && clientDeliveryFee !== null) {
      deliveryFee = Math.max(0, Number(clientDeliveryFee));
    } else {
      deliveryFee = subtotal >= 60000 ? 0 : 2500;
    }
    const total = subtotal + deliveryFee;

    const newOrder = {
      id: `ord-${Date.now()}`,
      reference,
      customerName: customerName || '',
      customerEmail,
      customerPhone: customerPhone || '',
      deliveryAddress: deliveryAddress || '',
      deliveryCity: deliveryCity || '',
      deliveryState: deliveryState || '',
      orderNotes: orderNotes || '',
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      currency: 'NGN',
      status: 'pending_payment',
      paymentChannel: 'paystack',
      createdAt: new Date().toISOString(),
    };

    // If real Paystack Secret Key is configured
    if (paystackSecretKey && paystackSecretKey.startsWith('sk_') && !paystackSecretKey.includes('xxx')) {
      try {
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: customerEmail,
            amount: Math.round(total * 100), // Paystack expects kobo
            reference,
            callback_url: `${siteUrl}/order-success/${reference}`,
            metadata: {
              customer_name: customerName,
              customer_phone: customerPhone,
              order_reference: reference,
              delivery_address: `${deliveryAddress}, ${deliveryCity}, ${deliveryState}`,
            },
          }),
        });

        const paystackData: any = await response.json();

        if (paystackData.status && paystackData.data?.authorization_url) {
          return res.status(200).json({
            success: true,
            status: true,
            order: newOrder,
            authorizationUrl: paystackData.data.authorization_url,
            accessCode: paystackData.data.access_code,
            reference,
          });
        } else {
          console.warn('Paystack rejected initialization:', paystackData);
          return res.status(400).json({
            success: false,
            status: false,
            error: paystackData.message || 'Paystack returned an error. Please verify your PAYSTACK_SECRET_KEY.',
            reference,
            details: paystackData,
          });
        }
      } catch (err: any) {
        console.error('Error contacting Paystack API:', err);
        return res.status(500).json({
          success: false,
          status: false,
          error: `Could not reach Paystack API: ${err.message}`,
          reference,
        });
      }
    }

    // Test/Demo fallback mode (when Paystack key is not yet configured in environment)
    return res.status(200).json({
      success: true,
      status: true,
      order: newOrder,
      isTestMode: true,
      authorizationUrl: `/order-success/${reference}?simulated=true`,
      accessCode: 'TEST_ACCESS_CODE',
      reference,
      message: 'Test mode authorization: Paystack live keys not configured.',
    });
  } catch (error: any) {
    console.error('Checkout initialization error:', error);
    return res.status(500).json({
      success: false,
      status: false,
      error: error.message || 'Server error during checkout initialization',
    });
  }
}
