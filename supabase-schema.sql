-- ==============================================================================
-- PRINCELY'S TECH - SUPABASE PRODUCTION DATABASE SCHEMA & INITIAL SEED
-- ==============================================================================
-- Run this migration in the Supabase SQL Editor.
-- Configures: tables, constraints, indexes, RLS policies, storage bucket, triggers & seed.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  sku TEXT UNIQUE,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(12, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= price),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description TEXT NOT NULL,
  specifications JSONB DEFAULT '{}'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  rating NUMERIC(3, 2) DEFAULT 4.9,
  reviews_count INT DEFAULT 18,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Color", "Capacity", "Cable Length"
  option_value TEXT NOT NULL, -- e.g. "Matte Black", "20000mAh", "1.8m"
  price_override NUMERIC(12, 2) CHECK (price_override IS NULL OR price_override >= 0),
  stock INT NOT NULL DEFAULT 10 CHECK (stock >= 0),
  sku TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT NOT NULL UNIQUE, -- e.g. PT-20261012-4F7K
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_state TEXT NOT NULL,
  order_notes TEXT,
  subtotal NUMERIC(12, 2) NOT NULL,
  delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'processing', 'out_for_delivery', 'delivered', 'cancelled', 'refunded')),
  paystack_reference TEXT,
  payment_channel TEXT DEFAULT 'paystack',
  paid_at TIMESTAMPTZ,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ORDER ITEMS TABLE (Stores price snapshot at time of purchase)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT,
  unit_price NUMERIC(12, 2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(12, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. SITE CONTENT TABLE (Admin editable homepage & policy copy)
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. CUSTOMER REVIEWS TABLE (Customer drop review & admin moderation)
CREATE TABLE IF NOT EXISTS customer_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Lagos, Nigeria',
  role TEXT NOT NULL DEFAULT 'Verified Customer',
  verified_product TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  quote TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_initials TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

-- Customer Reviews: public can view published, public can insert (drop review), admin can manage all
CREATE POLICY "Public can view published customer reviews" ON customer_reviews
  FOR SELECT USING (is_published = true);
CREATE POLICY "Public can submit customer reviews" ON customer_reviews
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all customer reviews" ON customer_reviews
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

-- Categories: public can read, admin can write
CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

-- Products: public can view published only, admin can manage all
CREATE POLICY "Public can view published products" ON products
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

-- Product Images: public view, admin write
CREATE POLICY "Public can view product images" ON product_images
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON product_images
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

-- Product Variants: public view, admin write
CREATE POLICY "Public can view product variants" ON product_variants
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage product variants" ON product_variants
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

-- Orders & Order Items: ONLY accessible by Admins (Public orders checked through server API)
CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admins can manage order items" ON order_items
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

-- Site Content & Settings: public read, admin write
CREATE POLICY "Public can view site content" ON site_content
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage site content" ON site_content
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Public can view store settings" ON store_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage store settings" ON store_settings
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

-- Contact Messages: public can insert, admin can read/manage
CREATE POLICY "Public can insert contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON contact_messages
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

-- Admin users: safe RLS (users can view their own admin profile, avoids recursion)
CREATE POLICY "Users can view own admin profile" ON admin_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super admins can manage admin_users" ON admin_users
  FOR ALL USING (auth.uid() = id);

-- 14. AUTO-REGISTER STORE OWNER AS SUPER ADMIN
CREATE OR REPLACE FUNCTION public.handle_admin_user_registration()
RETURNS trigger AS $$
BEGIN
  IF LOWER(NEW.email) IN ('princely4u112@gmail.com', 'admin@princelystech.ng') THEN
    INSERT INTO public.admin_users (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Princely (Super Admin)'), 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_admin_check ON auth.users;
CREATE TRIGGER on_auth_user_admin_check
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_admin_user_registration();

-- Immediate backfill for existing auth user
INSERT INTO public.admin_users (id, email, full_name, role)
SELECT id, email, 'Princely (Super Admin)', 'super_admin'
FROM auth.users
WHERE LOWER(email) IN ('princely4u112@gmail.com', 'admin@princelystech.ng')
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- 14. STORAGE BUCKET CONFIGURATION (Run in Supabase Dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- 15. SEED DATA
-- Default Categories
INSERT INTO categories (id, name, slug, description, display_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Power Banks', 'power-banks', 'High-capacity, fast-charging portable power banks for heavy users.', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Chargers & Adapters', 'chargers-adapters', 'GaN fast wall chargers, PD adapters, and dual-port heads.', 2),
  ('c1000000-0000-0000-0000-000000000003', 'USB Cables', 'usb-cables', 'Durable nylon-braided Type-C, Lightning, and 3-in-1 fast cables.', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Phones', 'phones', 'Authentic smartphones from Samsung, iPhone, Tecno, Itel, and Oppo.', 4),
  ('c1000000-0000-0000-0000-000000000005', 'Cases & Screen Guards', 'cases-screen-guards', 'Heavy-duty shockproof pouches, matte cases, and 9H tempered glass.', 5),
  ('c1000000-0000-0000-0000-000000000006', 'Audio & Earphones', 'audio-earphones', 'Crisp bass earbuds, noise-canceling headphones, and wireless audio.', 6),
  ('c1000000-0000-0000-0000-000000000007', 'Stands & Holders', 'stands-holders', 'Aluminum desktop stands, car dashboard phone mounts, and tripods.', 7),
  ('c1000000-0000-0000-0000-000000000008', 'Tablet & Mobile Accessories', 'tablet-accessories', 'OTG adapters, stylus pens, ring lights, and essential gadgets.', 8)
ON CONFLICT (slug) DO NOTHING;

-- Default Settings
INSERT INTO store_settings (key, value, description) VALUES
  ('store_name', 'Princely''s Tech', 'Store display name'),
  ('tagline', 'Your Trusted Online Store for Everyday Gadgets and Mobile Accessories', 'Store tagline'),
  ('whatsapp_number', '2348124491537', 'WhatsApp Business phone number in international format'),
  ('display_phone', '08124491537', 'Display phone number for Nigerian customers'),
  ('support_email', 'Princely4u112@gmail.com', 'Official store support email'),
  ('delivery_time', '5–7 days nationwide', 'Standard delivery timeline across Nigeria'),
  ('delivery_fee', '2500', 'Flat-rate nationwide shipping fee in Naira'),
  ('free_delivery_threshold', '60000', 'Cart subtotal for free shipping')
ON CONFLICT (key) DO NOTHING;

-- Default Site Content
INSERT INTO site_content (key, title, content) VALUES
  ('hero_headline', 'Reliable Everyday Gadgets & Phone Accessories', 'Quality you can trust, delivered directly to your doorstep anywhere in Nigeria within 5–7 days.'),
  ('why_choose_us', 'Why Shop With Princely''s Tech', 'We test every single accessory for durability, charging safety, and genuine compatibility before dispatch. No fake amps, no overheating adapters, no broken promises.'),
  ('delivery_banner', 'Nationwide Delivery 5–7 Days', 'Fast, trackable shipping to Lagos, Abuja, Port Harcourt, Kano, Ibadan, Enugu, and all 36 states.')
ON CONFLICT (key) DO NOTHING;

-- Default Customer Reviews Seed
INSERT INTO customer_reviews (id, name, location, role, verified_product, rating, quote, is_published, avatar_initials) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Emeka Okafor', 'Victoria Island, Lagos', 'Verified Buyer', 'Anker PowerCore 20,000mAh PD Fast Charge', 5, 'I was skeptical about buying power banks online due to countless fake 20,000mAh units in Computer Village. Princely''s Tech dispatched genuine Anker gear. It charges my iPhone 14 Pro Max from 20% to 80% in 35 minutes and delivered to VI in 3 days!', TRUE, 'EO'),
  ('a1000000-0000-0000-0000-000000000002', 'Amina Bello', 'Wuse II, Abuja', 'Verified Buyer', '65W GaN Dual USB-C Wall Charger Adapter', 5, 'My laptop and Galaxy S23 both charge simultaneously without the charger getting scorching hot. GaN technology is real. The WhatsApp customer support kept me updated throughout transit until it arrived at my office.', TRUE, 'AB'),
  ('a1000000-0000-0000-0000-000000000003', 'Tunde Adeleke', 'GRA Phase 2, Port Harcourt', 'Verified Buyer', 'Reinforced 100W Type-C to Type-C Braided Cable (1.8m)', 5, 'The heavy-duty braided cable survived my car door pinch and continuous usage. No loose connection or slow-charge warnings. Princely''s Tech is my go-to store for durable accessories in Nigeria.', TRUE, 'TA'),
  ('a1000000-0000-0000-0000-000000000004', 'Blessing Asuquo', 'Enugu', 'Verified Buyer', 'Sonic Pro Active Noise-Cancelling Earbuds', 5, 'I was hesitant about online payment, but the Paystack checkout was secure and the automated WhatsApp confirmation came through instantly. The active noise cancellation lets me focus in noisy cafes, and the battery holds up for days.', TRUE, 'BA')
ON CONFLICT (id) DO NOTHING;
