import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, Lock, ArrowLeft, AlertCircle, MessageCircle, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { NIGERIAN_STATES } from '../data/initialData';
import { formatNaira, validateNigerianPhone } from '../utils/formatters';
import { saveOrder } from '../services/store';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, deliveryTime, total, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Lagos',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastOrderRef, setLastOrderRef] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h1 className="font-heading text-2xl font-bold text-[#1E2A44]">Your cart is empty</h1>
        <p className="text-xs sm:text-sm text-[#64748B]">Please add items to your cart before proceeding to checkout.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E2A44] text-white text-xs font-semibold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shop</span>
        </Link>
      </div>
    );
  }

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      errs.fullName = 'Please enter your full name';
    }

    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email address';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!validateNigerianPhone(formData.phone)) {
      errs.phone = 'Please enter a valid Nigerian phone number (e.g. 08124491537 or +234...)';
    }

    if (!formData.address.trim() || formData.address.trim().length < 6) {
      errs.address = 'Please provide your full street delivery address';
    }

    if (!formData.city.trim()) {
      errs.city = 'Please enter your city/town';
    }

    if (!formData.state.trim()) {
      errs.state = 'Please select your delivery state';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Generate unique human-friendly order reference
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderRef = `PT-${dateStr}-${rand}`;
    setLastOrderRef(orderRef);

    try {
      // Step 1: Prepare comprehensive order items snapshot
      const orderItems = items.map((it) => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: it.productId,
        variantId: it.variantId,
        productName: it.product.name,
        variantName: it.variant ? `${it.variant.name}: ${it.variant.optionValue}` : undefined,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        totalPrice: it.unitPrice * it.quantity,
        imageUrl: it.product.images?.[0]?.url || '',
      }));

      // Step 2: Save the local order immediately so it is never lost
      const localOrder = {
        id: `ord-${Date.now()}`,
        reference: orderRef,
        customerName: formData.fullName.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),
        deliveryAddress: formData.address.trim(),
        deliveryCity: formData.city.trim(),
        deliveryState: formData.state.trim(),
        orderNotes: formData.notes.trim(),
        items: orderItems,
        subtotal,
        deliveryFee,
        total,
        currency: 'NGN' as const,
        status: 'pending_payment' as const,
        paymentChannel: 'paystack' as const,
        createdAt: new Date().toISOString(),
      };

      await saveOrder(localOrder);

      // Step 3: Send client payload to payment gateway initialize endpoint
      const payload = {
        customerName: localOrder.customerName,
        customerEmail: localOrder.customerEmail,
        customerPhone: localOrder.customerPhone,
        deliveryAddress: localOrder.deliveryAddress,
        deliveryCity: localOrder.deliveryCity,
        deliveryState: localOrder.deliveryState,
        orderNotes: localOrder.orderNotes,
        reference: orderRef,
        items: orderItems.map((it) => ({
          productId: it.productId,
          variantId: it.variantId,
          productName: it.productName,
          variantName: it.variantName,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
        })),
      };

      let res: Response | null = null;
      let data: any = null;

      try {
        res = await fetch('/api/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        data = await res.json().catch(() => null);
      } catch (fetchErr: any) {
        console.warn('Network call to payment initialize failed:', fetchErr);
      }

      // Check success across server.ts and Vercel serverless formats
      const isSuccess = Boolean(res?.ok && data && (data.success === true || data.status === true));
      const authUrl = data?.authorizationUrl || data?.data?.authorization_url;
      const finalRef = data?.reference || data?.data?.reference || orderRef;

      if (isSuccess && authUrl) {
        // Sync enriched order from server if available
        if (data.order) {
          await saveOrder(data.order);
        }

        // Clear cart now that payment is in motion
        clearCart();

        if (authUrl.startsWith('http')) {
          window.location.href = authUrl;
        } else {
          navigate(authUrl);
        }
        return;
      }

      // If gateway returned an error message (e.g. invalid keys, currency not supported)
      const errorMsg =
        data?.error ||
        data?.message ||
        (res && !res.ok ? `Gateway error (HTTP ${res.status})` : 'Unable to connect to Paystack payment gateway.');

      throw new Error(errorMsg);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setSubmitError(err.message || 'Payment initialization could not be completed.');
      setIsSubmitting(false);
    }
  };

  const handleSimulatedOrderFallback = async () => {
    if (!lastOrderRef) return;
    clearCart();
    navigate(`/order-success/${lastOrderRef}?simulated=true`);
  };

  const handleWhatsAppOrderFallback = () => {
    const whatsappNum = '2348124491537';
    const itemsList = items.map((it) => `• ${it.quantity}x ${it.product.name} (${formatNaira(it.unitPrice * it.quantity)})`).join('\n');
    const msg = `*NEW ORDER SUBMISSION* - Princely's Tech\nRef: ${lastOrderRef || 'DIRECT'}\n\n*Customer Details:*\nName: ${formData.fullName}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nAddress: ${formData.address}, ${formData.city}, ${formData.state}\n\n*Order Items:*\n${itemsList}\n\nSubtotal: ${formatNaira(subtotal)}\nDelivery: ${deliveryFee === 0 ? 'FREE' : formatNaira(deliveryFee)}\n*Total Due: ${formatNaira(total)}*`;
    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Checkout Breadcrumb / Back button */}
      <div className="flex items-center gap-3">
        <Link to="/cart" className="text-xs text-[#64748B] hover:text-[#1E2A44] flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left: Customer Information & Delivery Form */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#1E2A44]">
              Delivery Details
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Please enter accurate contact and delivery info so our dispatch team can reach you.
            </p>
          </div>

          {submitError && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 text-[#1E2A44] text-xs rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-900">Payment Gateway Response</p>
                  <p className="text-amber-800 text-[11px] leading-relaxed">{submitError}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/60 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSimulatedOrderFallback}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2A44] hover:bg-[#2A3B5F] text-white text-[11px] font-semibold rounded-md transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Complete in Test Mode (Instant Receipt)</span>
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppOrderFallback}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-md transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Order via WhatsApp (08124491537)</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Full Name <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Chukwuma Adeleke"
                className={`w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border rounded-lg focus:outline-none focus:bg-white text-[#1E2A44] ${
                  errors.fullName ? 'border-[#DC2626]' : 'border-[#E2E8F0] focus:border-[#1E2A44]'
                }`}
              />
              {errors.fullName && <p className="text-[11px] text-[#DC2626] mt-1">{errors.fullName}</p>}
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                  Email Address <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className={`w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border rounded-lg focus:outline-none focus:bg-white text-[#1E2A44] ${
                    errors.email ? 'border-[#DC2626]' : 'border-[#E2E8F0] focus:border-[#1E2A44]'
                  }`}
                />
                {errors.email && <p className="text-[11px] text-[#DC2626] mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                  Nigerian Phone Number <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08124491537"
                  className={`w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border rounded-lg focus:outline-none focus:bg-white text-[#1E2A44] ${
                    errors.phone ? 'border-[#DC2626]' : 'border-[#E2E8F0] focus:border-[#1E2A44]'
                  }`}
                />
                {errors.phone && <p className="text-[11px] text-[#DC2626] mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Street Address / House / Flat <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                className={`w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border rounded-lg focus:outline-none focus:bg-white text-[#1E2A44] ${
                  errors.address ? 'border-[#DC2626]' : 'border-[#E2E8F0] focus:border-[#1E2A44]'
                }`}
              />
              {errors.address && <p className="text-[11px] text-[#DC2626] mt-1">{errors.address}</p>}
            </div>

            {/* City & State Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                  City / Town <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Ikeja, Lekki, or Wuse 2"
                  className={`w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border rounded-lg focus:outline-none focus:bg-white text-[#1E2A44] ${
                    errors.city ? 'border-[#DC2626]' : 'border-[#E2E8F0] focus:border-[#1E2A44]'
                  }`}
                />
                {errors.city && <p className="text-[11px] text-[#DC2626] mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                  Delivery State (Nigeria) <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] text-[#1E2A44]"
                >
                  {NIGERIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Order Note */}
            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Order Notes / Special Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Call before arrival, leave with security gate"
                className="w-full px-3.5 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] text-[#1E2A44]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-[#E8553A] hover:bg-[#D14529] text-white font-bold text-sm sm:text-base rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isSubmitting ? 'Securing Order...' : `Pay ${formatNaira(total)} with Paystack`}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Order Summary Breakdown */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs sticky top-24">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44] pb-3 border-b border-[#E2E8F0]">
            Your Items
          </h2>

          <div className="divide-y divide-[#E2E8F0] max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId || 'base'}`} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center font-bold text-[#1E2A44] shrink-0">
                    {item.quantity}x
                  </span>
                  <div>
                    <p className="font-semibold text-[#1E2A44] line-clamp-1">{item.product.name}</p>
                    {item.variant && <p className="text-[#64748B] text-[11px]">{item.variant.optionValue}</p>}
                  </div>
                </div>
                <span className="font-bold text-[#1E2A44] tabular-nums shrink-0 ml-2">
                  {formatNaira(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 pt-3 border-t border-[#E2E8F0] text-xs sm:text-sm">
            <div className="flex items-center justify-between text-[#64748B]">
              <span>Subtotal</span>
              <span className="font-medium text-[#1E2A44] tabular-nums">{formatNaira(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-[#64748B]">
              <span>Nationwide Delivery</span>
              <span className="font-medium text-[#1E2A44] tabular-nums">
                {deliveryFee === 0 ? <span className="text-emerald-600 font-bold uppercase text-xs">FREE</span> : formatNaira(deliveryFee)}
              </span>
            </div>
            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-base font-extrabold text-[#1E2A44]">
              <span>Total Due</span>
              <span className="text-xl tabular-nums">{formatNaira(total)}</span>
            </div>
          </div>

          {/* Delivery & Security Assurance */}
          <div className="pt-4 border-t border-[#E2E8F0] space-y-2.5 text-xs text-[#64748B]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#1E2A44] shrink-0" />
              <span>Estimated Delivery: <strong>{deliveryTime || '5–7 days nationwide'}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1E2A44] shrink-0" />
              <span>Bank-level encryption via Paystack gateway</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
