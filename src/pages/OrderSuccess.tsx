import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Truck, Printer, X, ShoppingBag } from 'lucide-react';
import { Order } from '../types';
import { getOrderByRef, updateOrderStatus } from '../services/store';
import { formatNaira, generateWhatsAppOrderUrl } from '../utils/formatters';

export const OrderSuccess: React.FC = () => {
  const { orderRef } = useParams<{ orderRef: string }>();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // WhatsApp 5-second countdown state
  const [countdown, setCountdown] = useState(5);
  const [redirectCancelled, setRedirectCancelled] = useState(false);
  const countdownIntervalRef = useRef<any>(null);

  useEffect(() => {
    const verifyAndLoadOrder = async () => {
      if (!orderRef) return;

      try {
        // Call server verify endpoint
        const res = await fetch(`/api/paystack/verify/${orderRef}`);
        const data = await res.json();

        if (data.success && data.order) {
          setOrder(data.order);
          await updateOrderStatus(orderRef, 'paid');
        } else {
          // Fallback to local store order
          const localOrder = await getOrderByRef(orderRef);
          if (localOrder) {
            await updateOrderStatus(orderRef, 'paid');
            setOrder({ ...localOrder, status: 'paid' });
          }
        }
      } catch (err) {
        console.warn('Verification error, falling back to local order store:', err);
        const localOrder = await getOrderByRef(orderRef);
        if (localOrder) {
          setOrder({ ...localOrder, status: 'paid' });
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAndLoadOrder();
  }, [orderRef]);

  // Handle 5-second countdown & redirect
  useEffect(() => {
    if (!order || redirectCancelled) return;

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          const whatsappUrl = generateWhatsAppOrderUrl(order, '2348124491537');
          window.location.href = whatsappUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [order, redirectCancelled]);

  const handleCancelRedirect = () => {
    setRedirectCancelled(true);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-3 border-[#E8553A] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-[#1E2A44]">Verifying payment with Paystack...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-heading text-2xl font-bold text-[#1E2A44]">Order Not Found</h1>
        <p className="text-sm text-[#64748B]">
          We could not locate reference <span className="font-mono text-[#1E2A44]">{orderRef}</span>.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E2A44] text-white text-xs font-semibold rounded-lg"
        >
          <span>Return to Store</span>
        </Link>
      </div>
    );
  }

  const whatsappRedirectUrl = generateWhatsAppOrderUrl(order, '2348124491537');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Thank you Confirmation Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E2A44]">
            Payment Received & Order Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Thank you, <strong className="text-[#1E2A44]">{order.customerName}</strong>. Your payment has been verified.
          </p>
        </div>

        {/* 5-Second WhatsApp Countdown Box */}
        {!redirectCancelled && countdown > 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
            <p className="font-semibold text-amber-900">
              Automatically redirecting to WhatsApp in <span className="text-base font-bold tabular-nums text-[#E8553A]">{countdown}s</span> to send your order slip to our dispatch desk...
            </p>
            <div className="flex items-center justify-center gap-3 pt-1">
              <a
                href={whatsappRedirectUrl}
                className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Open WhatsApp Now</span>
              </a>
              <button
                onClick={handleCancelRedirect}
                className="px-3 py-2 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-medium rounded-lg inline-flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel Redirect</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <a
              href={whatsappRedirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold text-xs rounded-lg inline-flex items-center gap-2 shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Send Order Confirmation on WhatsApp</span>
            </a>
          </div>
        )}

        {/* Delivery Note */}
        <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-center gap-2 text-xs font-semibold text-[#1E2A44]">
          <Truck className="w-4 h-4 text-[#E8553A]" />
          <span>Your order will be delivered within 5–7 days nationwide.</span>
        </div>
      </div>

      {/* Order Slip / Invoice Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        
        {/* Slip Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E2E8F0] gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-semibold">Order Reference</span>
            <p className="font-mono text-lg sm:text-xl font-bold text-[#1E2A44]">{order.reference}</p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-slate-100 text-[#1E2A44] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Order Slip</span>
            </button>
          </div>
        </div>

        {/* Customer & Delivery Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-6 border-b border-[#E2E8F0]">
          <div>
            <h3 className="font-semibold text-[#1E2A44] uppercase tracking-wider mb-2">Delivery Address</h3>
            <p className="font-medium text-[#1E2A44]">{order.customerName}</p>
            <p className="text-[#64748B]">{order.deliveryAddress}</p>
            <p className="text-[#64748B]">{order.deliveryCity}, {order.deliveryState} State</p>
            <p className="text-[#64748B] mt-1 tabular-nums">Phone: {order.customerPhone}</p>
          </div>

          <div>
            <h3 className="font-semibold text-[#1E2A44] uppercase tracking-wider mb-2">Payment Details</h3>
            <p className="text-[#64748B]">Channel: <span className="font-medium text-[#1E2A44] uppercase">{order.paymentChannel}</span></p>
            <p className="text-[#64748B]">Status: <span className="font-bold text-emerald-600 uppercase">Paid & Verified</span></p>
            <p className="text-[#64748B] mt-1">Timeline: <span className="font-medium text-[#1E2A44]">5–7 Days Nationwide</span></p>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#1E2A44] uppercase tracking-wider">Purchased Items</h3>
          <div className="divide-y divide-[#E2E8F0]">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-[#1E2A44]">{item.productName}</p>
                  {item.variantName && <p className="text-[#64748B]">{item.variantName}</p>}
                  <p className="text-[#64748B]">{item.quantity} x {formatNaira(item.unitPrice)}</p>
                </div>
                <span className="font-bold text-[#1E2A44] tabular-nums">
                  {formatNaira(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-[#E2E8F0] space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-[#64748B]">
            <span>Subtotal</span>
            <span className="font-medium text-[#1E2A44] tabular-nums">{formatNaira(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#64748B]">
            <span>Nationwide Delivery</span>
            <span className="font-medium text-[#1E2A44] tabular-nums">
              {order.deliveryFee === 0 ? <span className="text-emerald-600 font-semibold uppercase text-xs">FREE</span> : formatNaira(order.deliveryFee)}
            </span>
          </div>
          <div className="pt-2 border-t border-[#E2E8F0] flex justify-between text-base font-extrabold text-[#1E2A44]">
            <span>Total Paid</span>
            <span className="text-xl tabular-nums">{formatNaira(order.total)}</span>
          </div>
        </div>

      </div>

      {/* Post Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 no-print">
        <Link
          to="/shop"
          className="w-full sm:w-auto px-6 py-3 bg-[#1E2A44] hover:bg-[#1E2A44]/90 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
        <Link
          to="/track-order"
          className="w-full sm:w-auto px-6 py-3 bg-white border border-[#E2E8F0] hover:border-[#1E2A44] text-[#1E2A44] font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Truck className="w-4 h-4" />
          <span>Track Order Status</span>
        </Link>
      </div>

    </div>
  );
};
