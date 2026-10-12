import express, { Request, Response } from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { z } from 'zod';
import { createServer as createViteServer } from 'vite';

dotenv.config();
process.env.DISABLE_HMR = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security Middleware & Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting in-memory store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: () => void) => {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait a moment before trying again.',
      });
    }

    record.count += 1;
    next();
  };
}

// In-memory persistent order & product store on server
interface ServerProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  variants?: { id: string; name: string; optionValue: string; priceOverride?: number; stock: number }[];
}

// Server catalog mirror for price verification
const SERVER_CATALOG: Record<string, ServerProduct> = {
  'prod-anker-powercore-20k': {
    id: 'prod-anker-powercore-20k',
    name: 'Anker PowerCore 20,000mAh PD Fast Charge Power Bank',
    price: 28500,
    stock: 24,
    variants: [
      { id: 'var-1a', name: 'Color', optionValue: 'Matte Obsidian Black', stock: 16 },
      { id: 'var-1b', name: 'Color', optionValue: 'Glacier White', stock: 8 }
    ]
  },
  'prod-gan-65w-wall-charger': {
    id: 'prod-gan-65w-wall-charger',
    name: '65W GaN Dual USB-C Fast Wall Charger Adapter',
    price: 18500,
    stock: 32,
    variants: [
      { id: 'var-2a', name: 'Color', optionValue: 'Matte Midnight Black', stock: 20 },
      { id: 'var-2b', name: 'Color', optionValue: 'Pure Frost White', stock: 12 }
    ]
  },
  'prod-sonic-pro-wireless-earbuds': {
    id: 'prod-sonic-pro-wireless-earbuds',
    name: 'Sonic Pro Active Noise-Cancelling Wireless Earbuds',
    price: 24000,
    stock: 19,
    variants: [
      { id: 'var-3a', name: 'Color', optionValue: 'Space Graphite', stock: 11 },
      { id: 'var-3b', name: 'Color', optionValue: 'Pearl White', stock: 8 }
    ]
  },
  'prod-oraimo-traveler-20k': {
    id: 'prod-oraimo-traveler-20k',
    name: 'Oraimo Traveler 20,000mAh Ultra-Slim Power Bank',
    price: 22000,
    stock: 15,
  },
  'prod-braided-100w-usbc-cable': {
    id: 'prod-braided-100w-usbc-cable',
    name: 'Heavy-Duty 100W Braided USB-C to USB-C Fast Cable',
    price: 6500,
    stock: 55,
    variants: [
      { id: 'var-5a', name: 'Length', optionValue: '1.2 Meter', priceOverride: 6500, stock: 35 },
      { id: 'var-5b', name: 'Length', optionValue: '2.0 Meter', priceOverride: 8000, stock: 20 }
    ]
  },
  'prod-3in1-fast-cable': {
    id: 'prod-3in1-fast-cable',
    name: '3-in-1 Fast Charging Nylon Cable (Lightning, Type-C, Micro)',
    price: 5500,
    stock: 40,
  },
  'prod-tecno-spark-20-pro': {
    id: 'prod-tecno-spark-20-pro',
    name: 'Tecno Spark 20 Pro (256GB ROM / 8GB RAM + 8GB Extended)',
    price: 185000,
    stock: 8,
  },
  'prod-samsung-galaxy-a15': {
    id: 'prod-samsung-galaxy-a15',
    name: 'Samsung Galaxy A15 (128GB ROM / 6GB RAM, Super AMOLED)',
    price: 210000,
    stock: 6,
  },
  'prod-9h-tempered-glass': {
    id: 'prod-9h-tempered-glass',
    name: '9H Full Coverage HD Tempered Glass Screen Protector (2-Pack)',
    price: 4000,
    stock: 80,
  },
  'prod-shockproof-magnetic-case': {
    id: 'prod-shockproof-magnetic-case',
    name: 'Military-Grade Shockproof Magnetic Matte Phone Case',
    price: 7500,
    stock: 45,
  },
  'prod-aluminum-desktop-stand': {
    id: 'prod-aluminum-desktop-stand',
    name: 'Adjustable Foldable Aluminum Desktop Phone & Tablet Stand',
    price: 9500,
    stock: 28,
  },
  'prod-car-airvent-mount': {
    id: 'prod-car-airvent-mount',
    name: '360° Rotatable Gravity Car Air Vent Phone Mount',
    price: 8000,
    stock: 35,
  }
};

const serverOrders = new Map<string, any>();

// Validation schema for checkout submission
const CheckoutSchema = z.object({
  customerName: z.string().min(2, 'Full name is required'),
  customerEmail: z.string().email('Valid email address is required'),
  customerPhone: z.string().min(10, 'Valid Nigerian phone number is required'),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  deliveryCity: z.string().min(2, 'City is required'),
  deliveryState: z.string().min(2, 'State is required'),
  orderNotes: z.string().optional(),
  reference: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      productName: z.string().optional(),
      variantName: z.string().optional(),
      unitPrice: z.number().optional(),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'At least one item is required in the order'),
});

// Helper to generate human-friendly reference e.g. PT-20261012-4F7K
function generateOrderReference(): string {
  const d = new Date();
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PT-${dateStr}-${randomChars}`;
}

// 1. API: INITIALIZE PAYSTACK TRANSACTION
app.post(
  '/api/paystack/initialize',
  rateLimiter(20, 60000), // 20 requests per minute
  async (req: Request, res: Response) => {
    try {
      const parsed = CheckoutSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          status: false,
          error: 'Validation failed. Please verify form details.',
          details: parsed.error.format(),
        });
      }

      const { customerName, customerEmail, customerPhone, deliveryAddress, deliveryCity, deliveryState, orderNotes, items, reference: clientRef } = parsed.data;

      // Server recalculates totals & verifies items
      let calculatedSubtotal = 0;
      const orderItems: any[] = [];

      for (const item of items) {
        const prod = SERVER_CATALOG[item.productId];
        let unitPrice = 0;
        let productName = item.productName || 'Gadget Accessory';
        let variantName = item.variantName;

        if (prod) {
          unitPrice = prod.price;
          productName = prod.name;
          if (item.variantId && prod.variants) {
            const variant = prod.variants.find((v) => v.id === item.variantId);
            if (variant) {
              if (variant.priceOverride) unitPrice = variant.priceOverride;
              variantName = `${variant.name}: ${variant.optionValue}`;
            }
          }
        } else if (item.unitPrice && item.unitPrice > 0) {
          // Dynamic product from Supabase or store inventory
          unitPrice = item.unitPrice;
        } else {
          unitPrice = 5000;
        }

        const itemTotal = unitPrice * item.quantity;
        calculatedSubtotal += itemTotal;

        orderItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: item.productId,
          variantId: item.variantId,
          productName,
          variantName,
          unitPrice,
          quantity: item.quantity,
          totalPrice: itemTotal,
        });
      }

      // Delivery Fee: flat 2500, free over 60000
      const deliveryFee = calculatedSubtotal >= 60000 ? 0 : 2500;
      const calculatedTotal = calculatedSubtotal + deliveryFee;

      const reference = clientRef || generateOrderReference();

      const newOrder: any = {
        id: `ord-${Date.now()}`,
        reference,
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        deliveryCity,
        deliveryState,
        orderNotes: orderNotes || '',
        subtotal: calculatedSubtotal,
        deliveryFee,
        total: calculatedTotal,
        currency: 'NGN',
        status: 'pending_payment',
        paymentChannel: 'paystack',
        items: orderItems,
        createdAt: new Date().toISOString(),
      };

      serverOrders.set(reference, newOrder);

      const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
      const siteUrl = process.env.APP_URL || process.env.VITE_SITE_URL || `http://localhost:${PORT}`;

      // Check if real Paystack secret key is present
      if (paystackSecretKey && paystackSecretKey.startsWith('sk_') && !paystackSecretKey.includes('xxx')) {
        try {
          const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${paystackSecretKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: customerEmail,
              amount: Math.round(calculatedTotal * 100), // in kobo
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

          const paystackData: any = await paystackResponse.json();

          if (paystackData.status && paystackData.data?.authorization_url) {
            newOrder.paystackReference = paystackData.data.reference || reference;
            serverOrders.set(reference, newOrder);

            return res.json({
              success: true,
              status: true,
              order: newOrder,
              authorizationUrl: paystackData.data.authorization_url,
              accessCode: paystackData.data.access_code,
              reference,
            });
          } else {
            console.warn('Paystack API response error:', paystackData);
            return res.status(400).json({
              success: false,
              status: false,
              error: paystackData.message || 'Paystack returned an error. Please verify your PAYSTACK_SECRET_KEY.',
              reference,
            });
          }
        } catch (paystackErr: any) {
          console.error('Error contacting Paystack API:', paystackErr);
          return res.status(500).json({
            success: false,
            status: false,
            error: `Could not connect to Paystack API: ${paystackErr.message}`,
            reference,
          });
        }
      }

      // Test/Demo fallback mode (when Paystack keys are pending in environment)
      return res.json({
        success: true,
        status: true,
        order: newOrder,
        isTestMode: true,
        authorizationUrl: `/order-success/${reference}?simulated=true`,
        accessCode: 'TEST_ACCESS_CODE',
        reference,
        message: 'Order created in test mode. Redirecting to payment confirmation.',
      });
    } catch (err: any) {
      console.error('Checkout initialization error:', err);
      res.status(500).json({ success: false, status: false, error: err.message || 'Internal server error' });
    }
  }
);

// 2. API: VERIFY PAYSTACK TRANSACTION
app.get(
  '/api/paystack/verify/:reference',
  rateLimiter(30, 60000),
  async (req: Request, res: Response) => {
    try {
      const { reference } = req.params;
      const order = serverOrders.get(reference);

      if (!order) {
        return res.status(404).json({ success: false, error: 'Order reference not found' });
      }

      // If already marked paid
      if (order.status === 'paid') {
        return res.json({ success: true, order, alreadyVerified: true });
      }

      const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

      if (paystackSecretKey && paystackSecretKey.startsWith('sk_') && !paystackSecretKey.includes('xxx')) {
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
        });
        const verifyData: any = await verifyRes.json();

        if (verifyData.status && verifyData.data?.status === 'success') {
          const paidAmount = verifyData.data.amount / 100;
          if (paidAmount >= order.total) {
            order.status = 'paid';
            order.paidAt = new Date().toISOString();
            order.paystackReference = verifyData.data.reference;

            // Deduct stock
            for (const item of order.items) {
              const catalogItem = SERVER_CATALOG[item.productId];
              if (catalogItem) {
                catalogItem.stock = Math.max(0, catalogItem.stock - item.quantity);
              }
            }

            serverOrders.set(reference, order);
            return res.json({ success: true, order });
          } else {
            return res.status(400).json({
              success: false,
              error: 'Paid amount does not match order total.',
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            error: verifyData.message || 'Payment verification failed',
          });
        }
      }

      // Test/Demo verification
      order.status = 'paid';
      order.paidAt = new Date().toISOString();
      serverOrders.set(reference, order);

      return res.json({ success: true, order, isTestMode: true });
    } catch (err: any) {
      console.error('Verify error:', err);
      res.status(500).json({ success: false, error: err.message || 'Internal verification error' });
    }
  }
);

// 3. API: PAYSTACK WEBHOOK
app.post('/api/paystack/webhook', (req: Request, res: Response) => {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return res.status(400).send('No webhook secret configured');
    }

    const signature = req.headers['x-paystack-signature'];
    if (!signature) {
      return res.status(400).send('Missing signature');
    }

    const hash = crypto
      .createHmac('sha512', paystackSecretKey)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const data = event.data;
      const reference = data.reference;
      const order = serverOrders.get(reference);

      if (order && order.status !== 'paid') {
        order.status = 'paid';
        order.paidAt = new Date().toISOString();
        order.paystackReference = data.reference;
        serverOrders.set(reference, order);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(500);
  }
});

// 4. API: GET ORDER BY REFERENCE
app.get('/api/orders/:reference', (req: Request, res: Response) => {
  const { reference } = req.params;
  const phone = req.query.phone as string | undefined;

  const order = serverOrders.get(reference);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  if (phone) {
    const cleanLookup = phone.replace(/\D/g, '').slice(-10);
    const cleanOrderPhone = order.customerPhone.replace(/\D/g, '').slice(-10);
    if (cleanLookup !== cleanOrderPhone) {
      return res.status(403).json({ success: false, error: 'Phone number verification failed' });
    }
  }

  res.json({ success: true, order });
});

// 5. API: CONTACT FORM SUBMISSION (With Honeypot)
const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(5),
  _hp: z.string().optional(), // Honeypot
});

app.post('/api/contact', rateLimiter(10, 60000), (req: Request, res: Response) => {
  const parsed = ContactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: 'Invalid contact form data' });
  }

  // If honeypot is filled, silent reject spam bot
  if (parsed.data._hp) {
    return res.json({ success: true, message: 'Message received' });
  }

  res.json({
    success: true,
    message: 'Thank you! Your message has been received. Our team will contact you shortly.',
  });
});

// Mount Vite or Serve Static Files
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Princely's Tech] Full-stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
