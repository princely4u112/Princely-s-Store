# Princely's Tech – Production E-Commerce Platform

"Your Trusted Online Store for Everyday Gadgets and Mobile Accessories in Nigeria."

Built with React, Vite, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth & Storage), and Paystack payment gateway with server-authoritative price verification and automated WhatsApp customer redirection.

---

## 1. Quick Start & Local Setup

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### Installation
```bash
# 1. Clone repository & install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Start development server (Full-stack with Vite + Express API)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Environment Variables (.env)

| Variable | Description | Exposure |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase Project URL (`https://xyz.supabase.co`) | Public Client |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Public Key | Public Client |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (for secure backend queries) | **Server Only** |
| `VITE_PAYSTACK_PUBLIC_KEY` | Paystack Public Key (`pk_test_...` or `pk_live_...`) | Public Client |
| `PAYSTACK_SECRET_KEY` | Paystack Secret Key (`sk_test_...` or `sk_live_...`) | **Server Only** |
| `VITE_WHATSAPP_NUMBER` | Store WhatsApp Business Number in international format (`2348124491537`) | Public Client |
| `VITE_SUPPORT_EMAIL` | Store Support Email (`Princely4u112@gmail.com`) | Public Client |
| `VITE_SITE_URL` | Production website URL (`https://princelystech.ng`) | Server / Client |

---

## 3. Supabase Setup & SQL Migration

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in the Supabase Dashboard.
3. Open `supabase-schema.sql` located in this repository root.
4. Copy and paste the entire script into the SQL editor and click **Run**.
5. This sets up:
   - `categories`, `products`, `product_images`, `product_variants`
   - `orders`, `order_items`, `site_content`, `store_settings`, `contact_messages`, `admin_users`
   - Row Level Security (RLS) policies allowing public read of published catalog items and restricting write / order management to authenticated admins.
6. Create the Storage Bucket:
   - Go to **Storage** -> **New Bucket**.
   - Name: `product-images`.
   - Toggle **Public Bucket** to ON (so uploaded photos are publicly viewable).

### Creating the First Admin User in Supabase
1. In the Supabase Dashboard, go to **Authentication** -> **Users** -> **Add User** -> **Create User**.
2. Enter the administrator email (`Princely4u112@gmail.com` or `admin@princelystech.ng`) and a secure password.
3. Copy the newly created user's **User UID**.
4. In the **SQL Editor**, run:
```sql
INSERT INTO admin_users (id, email, full_name, role)
VALUES ('<PASTE-USER-UID-HERE>', 'Princely4u112@gmail.com', 'Princely Admin', 'super_admin');
```

---

## 4. Secret Admin Access (Anti-Discovery)

To prevent bots, scrapers, and malicious users from discovering the admin login:
- The admin link does **not** exist in public navigation, footer, sitemap, or robots.txt.
- **How to access**: **Triple-tap or triple-click the "Princely's Tech" logo** in the header within 800 milliseconds.
- This immediately triggers client-side navigation to `/admin/login`.
- In local development mode without Supabase connected, enter `Princely4u112@gmail.com` with your admin password to access the full management suite immediately.

---

## 5. Paystack Integration & Live Payments

1. Register an account on [paystack.com](https://paystack.com).
2. Go to **Settings** -> **API Keys & Webhooks**:
   - For testing: Copy `pk_test_...` into `VITE_PAYSTACK_PUBLIC_KEY` and `sk_test_...` into `PAYSTACK_SECRET_KEY`.
   - Set **Live Webhook URL** to: `https://your-domain.vercel.app/api/paystack/webhook` (or `/api/paystack-webhook`).
3. For Go-Live:
   - Complete Paystack business compliance (CAC registration / Bank verification).
   - Switch keys to `pk_live_...` and `sk_live_...`.
4. Payment Flow Verification:
   - Client sends only item IDs, variant IDs, quantities, and customer details.
   - The server verifies prices against the catalog and creates an order reference (`PT-YYYYMMDD-XXXX`).
   - Customer pays via Paystack (Cards, USSD, Bank Transfer).
   - Paystack verifies transaction.
   - On payment confirmation, order redirects to `/order-success/:orderRef`.
   - A 5-second countdown timer automatically redirects the customer to WhatsApp (`https://wa.me/2348124491537`) with a prefilled message containing order reference, items, customer name, and delivery address.

---

## 6. Deployment to Vercel & Netlify

### Deploying to Vercel
1. Push your repository to GitHub or GitLab.
2. In [Vercel](https://vercel.com), click **Add New Project** and select the repository.
3. Framework Preset: **Vite**.
4. Configure Environment Variables in the Vercel Project Settings (add all variables from Section 2).
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**. `vercel.json` will automatically route API endpoints and handle SPA rewrites.

### Deploying to Netlify
1. Connect your repository in [Netlify](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. The included `netlify.toml` and `public/_redirects` ensure smooth direct URL refreshes without 404 errors.

---

## 7. Pre-Launch Checklist

- [x] All 16 public and admin routes render cleanly and survive page refresh.
- [x] Triple-tap on the logo navigates to `/admin/login`.
- [x] Responsive layout verified at 360px mobile, 768px tablet, and 1280px+ desktop.
- [x] Floating WhatsApp button operates without covering mobile checkout buttons.
- [x] Nigerian phone format validation accepts `080...`, `090...`, `081...`, and `+234...`.
- [x] Currency is consistently formatted in Nigerian Naira (`₦25,000`) with tabular numerals.
- [x] 5-second countdown to WhatsApp redirect on order success works with fallback button.
- [x] Product image uploads support device camera and file compression up to 5MB.
- [x] Robots.txt blocks crawling of `/admin`.
- [x] Structured JSON-LD metadata and OpenGraph tags configured.
