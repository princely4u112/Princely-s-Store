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
const args = process.argv.slice(2);
const portArgIndex = args.indexOf('--port');
const cliPort = portArgIndex !== -1 && args[portArgIndex + 1] ? Number(args[portArgIndex + 1]) : null;
const isDev = process.env.NODE_ENV !== 'production';
const PORT = cliPort || (isDev ? 3000 : (Number(process.env.PORT) || 3000));

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

import {
  getAllProducts,
  getProductByIdOrSlug,
  saveProduct,
  deleteProduct,
  getAllCategories,
  saveCategory,
  deleteCategory,
  getAllOrders,
  getOrderByReference,
  saveOrder as saveOrderToDb,
  updateOrderStatus,
  getSettings,
  saveSettings,
  getContent,
  saveContent,
  getAllContacts,
  saveContact,
  markContactRead,
} from './server/db.ts';

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
  deliveryFee: z.number().min(0).optional(),
  subtotal: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
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

// -------------------------------------------------------------
// REST API: PRODUCTS
// -------------------------------------------------------------
app.get('/api/products', (req: Request, res: Response) => {
  const includeUnpublished = req.query.all === 'true';
  const products = getAllProducts(includeUnpublished);
  res.json({ success: true, products });
});

app.get('/api/products/:idOrSlug', (req: Request, res: Response) => {
  const product = getProductByIdOrSlug(req.params.idOrSlug);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, product });
});

app.post('/api/products', (req: Request, res: Response) => {
  try {
    const saved = saveProduct(req.body);
    res.json({ success: true, product: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to save product' });
  }
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const ok = deleteProduct(req.params.id);
  res.json({ success: ok });
});

// -------------------------------------------------------------
// REST API: CATEGORIES
// -------------------------------------------------------------
app.get('/api/categories', (req: Request, res: Response) => {
  const categories = getAllCategories();
  res.json({ success: true, categories });
});

app.post('/api/categories', (req: Request, res: Response) => {
  try {
    const saved = saveCategory(req.body);
    res.json({ success: true, category: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to save category' });
  }
});

app.delete('/api/categories/:id', (req: Request, res: Response) => {
  const ok = deleteCategory(req.params.id);
  res.json({ success: ok });
});

// -------------------------------------------------------------
// REST API: ORDERS
// -------------------------------------------------------------
app.get('/api/orders', (req: Request, res: Response) => {
  const orders = getAllOrders();
  res.json({ success: true, orders });
});

app.get('/api/orders/:reference', (req: Request, res: Response) => {
  const order = getOrderByReference(req.params.reference);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, order });
});

app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const saved = saveOrderToDb(req.body);
    res.json({ success: true, order: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to save order' });
  }
});

app.patch('/api/orders/:idOrRef/status', (req: Request, res: Response) => {
  const { status, internalNotes } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required' });
  }
  const updated = updateOrderStatus(req.params.idOrRef, status, internalNotes);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, order: updated });
});

// -------------------------------------------------------------
// REST API: STORE SETTINGS
// -------------------------------------------------------------
app.get('/api/settings', (req: Request, res: Response) => {
  const settings = getSettings();
  res.json({ success: true, settings });
});

app.put('/api/settings', (req: Request, res: Response) => {
  try {
    const saved = saveSettings(req.body);
    res.json({ success: true, settings: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to save settings' });
  }
});

// -------------------------------------------------------------
// REST API: SITE CONTENT
// -------------------------------------------------------------
app.get('/api/content', (req: Request, res: Response) => {
  const content = getContent();
  res.json({ success: true, content });
});

app.put('/api/content', (req: Request, res: Response) => {
  try {
    const saved = saveContent(req.body);
    res.json({ success: true, content: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to save content' });
  }
});

// -------------------------------------------------------------
// REST API: CONTACT MESSAGES
// -------------------------------------------------------------
app.get('/api/contacts', (req: Request, res: Response) => {
  const contacts = getAllContacts();
  res.json({ success: true, contacts });
});

app.patch('/api/contacts/:id/read', (req: Request, res: Response) => {
  const ok = markContactRead(req.params.id);
  res.json({ success: ok });
});

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
      } = parsed.data;

      // Server recalculates totals & verifies items
      let calculatedSubtotal = 0;
      const orderItems: any[] = [];

      for (const item of items) {
        const prod = getProductByIdOrSlug(item.productId);
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

      // Delivery Fee:
      // Respect client deliveryFee (e.g. 0 for nationwide free shipping or custom rate from admin settings)
      const currentSettings = getSettings();
      let deliveryFee = currentSettings.deliveryFee !== undefined ? currentSettings.deliveryFee : 2500;
      if (clientDeliveryFee !== undefined && clientDeliveryFee !== null) {
        deliveryFee = Math.max(0, Number(clientDeliveryFee));
      } else if (currentSettings.freeDeliveryThreshold && calculatedSubtotal >= currentSettings.freeDeliveryThreshold) {
        deliveryFee = 0;
      }
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

      saveOrderToDb(newOrder);

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
            saveOrderToDb(newOrder);

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
      const order = getOrderByReference(reference);

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
            const updated = updateOrderStatus(reference, 'paid');
            if (updated) {
              updated.paystackReference = verifyData.data.reference;
              saveOrderToDb(updated);
            }
            return res.json({ success: true, order: updated || order });
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
      const updated = updateOrderStatus(reference, 'paid');
      return res.json({ success: true, order: updated || order, isTestMode: true });
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
      updateOrderStatus(reference, 'paid');
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(500);
  }
});

// 4. API: GET ORDER BY REFERENCE (With Phone Verification)
app.get('/api/orders/:reference', (req: Request, res: Response) => {
  const { reference } = req.params;
  const phone = req.query.phone as string | undefined;

  const order = getOrderByReference(reference);
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

  saveContact({
    fullName: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || '',
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

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

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Princely's Tech] Full-stack Server listening on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Princely's Tech] Port ${PORT} already active.`);
    } else {
      console.error('[Princely\'s Tech] Server listen error:', err);
    }
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
