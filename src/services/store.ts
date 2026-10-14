import { Category, ContactMessage, CustomerReview, Order, OrderStatus, Product, SiteContent, StoreSettings } from '../types';
import { INITIAL_CATEGORIES, INITIAL_CONTENT, INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialData';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  PRODUCTS: 'princelys_tech_products_v2',
  CATEGORIES: 'princelys_tech_categories_v2',
  ORDERS: 'princelys_tech_orders_v2',
  SETTINGS: 'princelys_tech_settings_v2',
  CONTENT: 'princelys_tech_content_v2',
  CONTACTS: 'princelys_tech_contacts_v2',
  REVIEWS: 'princelys_tech_reviews_v1',
};

// Listeners for reactive updates
type StoreListener = () => void;
const listeners: Set<StoreListener> = new Set();

export function subscribeToStore(listener: StoreListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((l) => {
    try {
      l();
    } catch (e) {
      console.error(e);
    }
  });
}

// Local Storage helpers
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Failed to parse localStorage key ${key}:`, err);
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (err) {
    console.error(`Failed to write to localStorage key ${key}:`, err);
  }
}

// PRODUCTS
export async function getProducts(includeUnpublished = false): Promise<Product[]> {
  try {
    const res = await fetch(`/api/products?all=${includeUnpublished}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setLocalItem(STORAGE_KEYS.PRODUCTS, data.products);
        return includeUnpublished ? data.products : data.products.filter((p: Product) => p.isPublished);
      }
    }
  } catch (err) {
    console.warn('Failed to fetch products from server, falling back to local cache:', err);
  }

  // Fallback to local storage or initial seed
  const local = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  return includeUnpublished ? local : local.filter((p) => p.isPublished);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${slug}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.product) return data.product;
    }
  } catch (err) {
    // Ignore and fallback
  }
  const products = await getProducts(true);
  return products.find((p) => p.slug === slug) || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.product) return data.product;
    }
  } catch (err) {
    // Ignore and fallback
  }
  const products = await getProducts(true);
  return products.find((p) => p.id === id) || null;
}

export async function saveProduct(product: Partial<Product> & { name: string; price: number; categoryId: string }): Promise<Product> {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.product) {
        // Update local cache
        const currentProducts = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const idx = currentProducts.findIndex((p) => p.id === data.product.id);
        if (idx !== -1) {
          currentProducts[idx] = data.product;
        } else {
          currentProducts.unshift(data.product);
        }
        setLocalItem(STORAGE_KEYS.PRODUCTS, currentProducts);
        notifyListeners();
        return data.product;
      }
    }
  } catch (err) {
    console.warn('API saveProduct failed, updating local storage:', err);
  }

  // Fallback local update
  const currentProducts = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const categories = await getCategories();
  const cat = categories.find((c) => c.id === product.categoryId);

  if (product.id) {
    const index = currentProducts.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      const updated: Product = {
        ...currentProducts[index],
        ...product,
        categoryName: cat?.name || currentProducts[index].categoryName || 'Accessories',
        updatedAt: new Date().toISOString(),
      };
      currentProducts[index] = updated;
      setLocalItem(STORAGE_KEYS.PRODUCTS, currentProducts);
      return updated;
    }
  }

  const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);
  const newProduct: Product = {
    id: product.id || 'prod-' + Date.now(),
    name: product.name,
    slug,
    categoryId: product.categoryId,
    categoryName: cat?.name || 'Accessories',
    sku: product.sku || 'PT-' + Math.floor(1000 + Math.random() * 9000),
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock !== undefined ? product.stock : 10,
    description: product.description || '',
    specifications: product.specifications || {},
    isFeatured: Boolean(product.isFeatured),
    isPublished: product.isPublished !== undefined ? product.isPublished : true,
    rating: product.rating || 5.0,
    reviewsCount: product.reviewsCount || 1,
    images: product.images && product.images.length > 0 ? product.images : [
      { id: 'img-' + Date.now(), url: INITIAL_PRODUCTS[0].images[0].url, altText: product.name, isPrimary: true }
    ],
    variants: product.variants || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [newProduct, ...currentProducts];
  setLocalItem(STORAGE_KEYS.PRODUCTS, updatedList);
  return newProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('API deleteProduct failed:', err);
  }

  const current = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const filtered = current.filter((p) => p.id !== id);
  setLocalItem(STORAGE_KEYS.PRODUCTS, filtered);
  return true;
}

export async function updateProductStock(id: string, newStock: number): Promise<boolean> {
  const current = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const target = current.find((p) => p.id === id);
  if (target) {
    target.stock = Math.max(0, newStock);
    await saveProduct(target);
    return true;
  }
  return false;
}

// CATEGORIES
export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setLocalItem(STORAGE_KEYS.CATEGORIES, data.categories);
        return data.categories.sort((a: Category, b: Category) => a.displayOrder - b.displayOrder);
      }
    }
  } catch (err) {
    console.warn('Failed to fetch categories from server:', err);
  }

  const local = getLocalItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  return local.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function saveCategory(category: Partial<Category> & { name: string }): Promise<Category> {
  try {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.category) {
        const current = getLocalItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
        const idx = current.findIndex((c) => c.id === data.category.id);
        if (idx !== -1) current[idx] = data.category;
        else current.push(data.category);
        setLocalItem(STORAGE_KEYS.CATEGORIES, current);
        notifyListeners();
        return data.category;
      }
    }
  } catch (err) {
    console.warn('API saveCategory failed:', err);
  }

  const current = getLocalItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  if (category.id) {
    const idx = current.findIndex((c) => c.id === category.id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...category, slug };
      setLocalItem(STORAGE_KEYS.CATEGORIES, current);
      return current[idx];
    }
  }

  const newCat: Category = {
    id: category.id || 'cat-' + Date.now(),
    name: category.name,
    slug,
    description: category.description || '',
    displayOrder: category.displayOrder || current.length + 1,
  };

  setLocalItem(STORAGE_KEYS.CATEGORIES, [...current, newCat]);
  return newCat;
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('API deleteCategory failed:', err);
  }

  const current = getLocalItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  setLocalItem(STORAGE_KEYS.CATEGORIES, current.filter((c) => c.id !== id));
  return true;
}

// ORDERS
export async function getOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setLocalItem(STORAGE_KEYS.ORDERS, data.orders);
        return data.orders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }
  } catch (err) {
    console.warn('Failed to fetch orders from server:', err);
  }

  const orders = getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, []);
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrderByRef(ref: string, phoneVerification?: string): Promise<Order | null> {
  try {
    const url = `/api/orders/${ref}${phoneVerification ? '?phone=' + encodeURIComponent(phoneVerification) : ''}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.order) return data.order;
    }
  } catch (err) {
    console.warn('Failed to fetch order by ref from server:', err);
  }

  const orders = await getOrders();
  const order = orders.find((o) => o.reference.toLowerCase() === ref.toLowerCase());
  if (!order) return null;

  if (phoneVerification) {
    const cleanLookup = phoneVerification.replace(/\D/g, '').slice(-10);
    const cleanCustomer = order.customerPhone.replace(/\D/g, '').slice(-10);
    if (cleanLookup !== cleanCustomer) {
      return null;
    }
  }
  return order;
}

export async function saveOrder(order: Order): Promise<Order> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.order) {
        const orders = getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, []);
        const idx = orders.findIndex((o) => o.reference === data.order.reference);
        if (idx !== -1) orders[idx] = data.order;
        else orders.unshift(data.order);
        setLocalItem(STORAGE_KEYS.ORDERS, orders);
        notifyListeners();
        return data.order;
      }
    }
  } catch (err) {
    console.warn('API saveOrder failed:', err);
  }

  const orders = getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, []);
  const existingIdx = orders.findIndex((o) => o.reference === order.reference);
  if (existingIdx !== -1) {
    orders[existingIdx] = order;
  } else {
    orders.unshift(order);
  }
  setLocalItem(STORAGE_KEYS.ORDERS, orders);
  return order;
}

export async function updateOrderStatus(orderIdOrRef: string, status: OrderStatus, internalNotes?: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${orderIdOrRef}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, internalNotes }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.order) {
        const orders = getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, []);
        const idx = orders.findIndex((o) => o.id === data.order.id || o.reference === data.order.reference);
        if (idx !== -1) orders[idx] = data.order;
        setLocalItem(STORAGE_KEYS.ORDERS, orders);
        notifyListeners();
        return data.order;
      }
    }
  } catch (err) {
    console.warn('API updateOrderStatus failed:', err);
  }

  const orders = getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, []);
  const order = orders.find((o) => o.id === orderIdOrRef || o.reference === orderIdOrRef);
  if (!order) return null;

  order.status = status;
  if (status === 'paid' && !order.paidAt) {
    order.paidAt = new Date().toISOString();
  }
  if (internalNotes !== undefined) {
    order.internalNotes = internalNotes;
  }
  order.updatedAt = new Date().toISOString();

  setLocalItem(STORAGE_KEYS.ORDERS, [...orders]);
  return order;
}

// SETTINGS
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        setLocalItem(STORAGE_KEYS.SETTINGS, data.settings);
        return data.settings;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch settings from server:', err);
  }

  return getLocalItem<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export async function saveStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        setLocalItem(STORAGE_KEYS.SETTINGS, data.settings);
        notifyListeners();
        return data.settings;
      }
    }
  } catch (err) {
    console.warn('API saveStoreSettings failed:', err);
  }

  const current = getLocalItem<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  const updated = { ...current, ...settings };
  setLocalItem(STORAGE_KEYS.SETTINGS, updated);
  notifyListeners();
  return updated;
}

// SITE CONTENT
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const res = await fetch('/api/content');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.content) {
        setLocalItem(STORAGE_KEYS.CONTENT, data.content);
        return data.content;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch site content from server:', err);
  }
  return getLocalItem<SiteContent>(STORAGE_KEYS.CONTENT, INITIAL_CONTENT);
}

export async function saveSiteContent(content: Partial<SiteContent>): Promise<SiteContent> {
  try {
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.content) {
        setLocalItem(STORAGE_KEYS.CONTENT, data.content);
        notifyListeners();
        return data.content;
      }
    }
  } catch (err) {
    console.warn('API saveSiteContent failed:', err);
  }

  const current = getLocalItem<SiteContent>(STORAGE_KEYS.CONTENT, INITIAL_CONTENT);
  const updated = { ...current, ...content };
  setLocalItem(STORAGE_KEYS.CONTENT, updated);
  return updated;
}

// CONTACT MESSAGES
export async function saveContactMessage(msg: Omit<ContactMessage, 'id' | 'isRead' | 'createdAt'>): Promise<ContactMessage> {
  try {
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.contact) {
        const current = getLocalItem<ContactMessage[]>(STORAGE_KEYS.CONTACTS, []);
        setLocalItem(STORAGE_KEYS.CONTACTS, [data.contact, ...current]);
        notifyListeners();
        return data.contact;
      }
    }
  } catch (err) {
    console.warn('API saveContactMessage failed:', err);
  }

  const current = getLocalItem<ContactMessage[]>(STORAGE_KEYS.CONTACTS, []);
  const newMsg: ContactMessage = {
    id: 'msg-' + Date.now(),
    ...msg,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  setLocalItem(STORAGE_KEYS.CONTACTS, [newMsg, ...current]);
  return newMsg;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const res = await fetch('/api/contacts');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.contacts)) {
        setLocalItem(STORAGE_KEYS.CONTACTS, data.contacts);
        return data.contacts;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch contact messages from server:', err);
  }
  return getLocalItem<ContactMessage[]>(STORAGE_KEYS.CONTACTS, []);
}

export async function markMessageRead(id: string): Promise<void> {
  try {
    await fetch(`/api/contacts/${id}/read`, { method: 'PATCH' });
  } catch (err) {
    console.warn('API markMessageRead failed:', err);
  }

  const current = getLocalItem<ContactMessage[]>(STORAGE_KEYS.CONTACTS, []);
  const target = current.find((m) => m.id === id);
  if (target) {
    target.isRead = true;
    setLocalItem(STORAGE_KEYS.CONTACTS, [...current]);
  }
}

// IMAGE COMPRESSION & UPLOAD
export async function uploadProductImage(file: File): Promise<string> {
  // Validate size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size exceeds 5MB limit. Please select a smaller photo.');
  }

  // Validate type
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
    throw new Error('Invalid image format. Please upload JPG, PNG, or WebP.');
  }

  // Compress & resize image to max 1200px width/height using an offscreen canvas
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        // If Supabase Storage is configured, upload to 'product-images' bucket
        if (isSupabaseConfigured && supabase) {
          const sb = supabase;
          try {
            canvas.toBlob(async (blob) => {
              if (!blob) return resolve(dataUrl);
              const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
              const { data, error } = await sb.storage
                .from('product-images')
                .upload(fileName, blob, { contentType: 'image/jpeg' });

              if (!error && data) {
                const { data: publicUrlData } = sb.storage
                  .from('product-images')
                  .getPublicUrl(data.path);
                return resolve(publicUrlData.publicUrl);
              }
              // If bucket does not exist yet, resolve base64 dataUrl
              resolve(dataUrl);
            }, 'image/jpeg', 0.85);
            return;
          } catch (storageErr) {
            console.warn('Supabase storage upload error, falling back to data URL:', storageErr);
            resolve(dataUrl);
            return;
          }
        }

        // Return compressed data URL for local storage/offline preview
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to process image file.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

// CUSTOMER REVIEWS
const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    name: 'Tunde Bakare',
    location: 'Ikeja, Lagos',
    role: 'Software Developer',
    verifiedProduct: 'Anker PowerCore 20,000mAh PD Power Bank',
    rating: 5,
    quote: 'I had bought two fake power banks along the road in Ikeja that died within a month. This Anker from Princely\'s Tech is 100% genuine—it gives my iPhone 14 Pro four full charges during prolonged power outages without getting hot. Dispatched to my doorstep in 2 days.',
    isPublished: true,
    avatarInitials: 'TB',
    createdAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'rev-2',
    name: 'Aisha Bello',
    location: 'Gwarinpa, Abuja',
    role: 'Remote Designer & Consultant',
    verifiedProduct: '65W GaN Dual USB-C Fast Wall Charger',
    rating: 5,
    quote: 'The 65W GaN adapter powers both my laptop and phone simultaneously without dangerous heat buildup. Most cheap adapters cause ghost touch on your screen while charging, but this one is completely stable. Nationwide delivery to Abuja was smooth and tracked.',
    isPublished: true,
    avatarInitials: 'AB',
    createdAt: '2026-03-10T14:30:00Z',
  },
  {
    id: 'rev-3',
    name: 'Emeka Okonkwo',
    location: 'GRA, Port Harcourt',
    role: 'Field Logistics Engineer',
    verifiedProduct: 'Heavy-Duty 100W Braided USB-C Cable',
    rating: 5,
    quote: 'The nylon braiding on this cable is genuinely rugged. Other cables I bought snapped at the neck when tossed in my backpack or truck. 4 months in and this cable looks brand new. Princely\'s Tech has earned my trust.',
    isPublished: true,
    avatarInitials: 'EO',
    createdAt: '2026-03-05T09:15:00Z',
  },
  {
    id: 'rev-4',
    name: 'Blessing Adeleke',
    location: 'Bodija, Ibadan',
    role: 'Postgraduate Researcher',
    verifiedProduct: 'Sonic Pro ANC Wireless Earbuds',
    rating: 5,
    quote: 'I was hesitant about online payment, but the Paystack checkout was secure and the automated WhatsApp confirmation came through instantly. The active noise cancellation lets me focus in noisy cafes, and the battery holds up for days.',
    isPublished: true,
    avatarInitials: 'BA',
    createdAt: '2026-02-28T16:45:00Z',
  },
];

export async function getReviews(publishedOnly = true): Promise<CustomerReview[]> {
  const reviews = getLocalItem<CustomerReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  const sorted = [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return publishedOnly ? sorted.filter((r) => r.isPublished) : sorted;
}

export async function saveReview(review: Partial<CustomerReview> & { name: string; quote: string; verifiedProduct: string }): Promise<CustomerReview> {
  const current = getLocalItem<CustomerReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);

  const initials = review.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'PT';

  if (review.id) {
    const idx = current.findIndex((r) => r.id === review.id);
    if (idx !== -1) {
      current[idx] = {
        ...current[idx],
        ...review,
        avatarInitials: initials,
        updatedAt: new Date().toISOString(),
      };
      setLocalItem(STORAGE_KEYS.REVIEWS, current);
      return current[idx];
    }
  }

  const newReview: CustomerReview = {
    id: 'rev-' + Date.now(),
    name: review.name,
    location: review.location || 'Nigeria',
    role: review.role || 'Verified Customer',
    verifiedProduct: review.verifiedProduct,
    productId: review.productId,
    rating: review.rating || 5,
    quote: review.quote,
    isPublished: review.isPublished !== undefined ? review.isPublished : true,
    avatarInitials: initials,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [newReview, ...current];
  setLocalItem(STORAGE_KEYS.REVIEWS, updatedList);
  return newReview;
}

export async function deleteReview(id: string): Promise<boolean> {
  const current = getLocalItem<CustomerReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  const filtered = current.filter((r) => r.id !== id);
  setLocalItem(STORAGE_KEYS.REVIEWS, filtered);
  return true;
}

