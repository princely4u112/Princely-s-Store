export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface ProductVariant {
  id: string;
  productId?: string;
  name: string; // e.g. "Color", "Capacity", "Compatibility"
  optionValue: string; // e.g. "Matte Black", "20000mAh", "iPhone 15"
  priceOverride?: number; // Optional price override
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  description: string;
  specifications: Record<string, string>;
  isFeatured: boolean;
  isPublished: boolean;
  rating: number;
  reviewsCount: number;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  imageUrl?: string;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  orderId?: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  orderNotes?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paystackReference?: string;
  paymentChannel?: string;
  paidAt?: string;
  internalNotes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  displayPhone: string;
  supportEmail: string;
  deliveryTime: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  address: string;
}

export interface SiteContent {
  heroHeadline: string;
  heroSubtext: string;
  whyChooseUsTitle: string;
  whyChooseUsBody: string;
  deliveryBannerText: string;
  footerText: string;
  aboutText: string;
  warrantyText: string;
  returnsText: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'admin' | 'editor';
}

export interface CustomerReview {
  id: string;
  name: string;
  location: string;
  role?: string;
  verifiedProduct: string;
  productId?: string;
  rating: number;
  quote: string;
  isPublished: boolean;
  avatarInitials?: string;
  createdAt: string;
  updatedAt?: string;
}
