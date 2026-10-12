import { Order } from '../types';

/**
 * Format amount in Nigerian Naira (e.g., ₦25,000)
 */
export function formatNaira(amount: number): string {
  const rounded = Math.round(amount);
  return '₦' + rounded.toLocaleString('en-NG');
}

/**
 * Format international date string to clean readable format
 */
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Validates Nigerian phone numbers (e.g., 080..., 090..., 070..., 081..., +234..., 234...)
 */
export function validateNigerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('234') && cleaned.length === 13) {
    return true;
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return true;
  }
  return false;
}

/**
 * Standardize Nigerian phone number to international format (234...)
 */
export function standardizeNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('234')) {
    return cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '234' + cleaned.substring(1);
  }
  return '234' + cleaned;
}

/**
 * Builds the WhatsApp redirect URL for an order with prefilled breakdown
 */
export function generateWhatsAppOrderUrl(order: Order, whatsappNumber = '2348124491537'): string {
  const itemsText = order.items
    .map((item) => `${item.quantity}x ${item.productName}${item.variantName ? ` (${item.variantName})` : ''}`)
    .join(', ');

  const text = `Hello Princely's Tech! I just completed payment for my order ${order.reference}.

📦 Items: ${itemsText}
💰 Total Paid: ${formatNaira(order.total)}
👤 Name: ${order.customerName}
📞 Phone: ${order.customerPhone}
📍 Delivery Address: ${order.deliveryAddress}, ${order.deliveryCity}, ${order.deliveryState} State.

Kindly confirm my dispatch. Thank you!`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Builds WhatsApp inquiry URL for a product
 */
export function generateWhatsAppProductUrl(
  productName: string,
  productSlug: string,
  price: number,
  whatsappNumber = '2348124491537'
): string {
  const fullUrl = `${window.location.origin}/product/${productSlug}`;
  const text = `Hello Princely's Tech, I am interested in purchasing:
"${productName}" (${formatNaira(price)}).

Product link: ${fullUrl}

Is this currently available for 5-7 days nationwide dispatch?`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}
