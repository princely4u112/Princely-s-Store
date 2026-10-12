import React, { useState } from 'react';
import { Search, Package, CheckCircle2, Clock, Truck, AlertCircle, MessageCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { getOrderByRef } from '../services/store';
import { formatDate, formatNaira } from '../utils/formatters';

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'paid', label: 'Payment Confirmed', desc: 'Verified and queued for warehouse dispatch' },
  { key: 'processing', label: 'Processing & Quality Check', desc: 'Tested and packed in shockproof parcel' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'In transit with nationwide logistics courier' },
  { key: 'delivered', label: 'Delivered', desc: 'Safely delivered to customer address' },
];

export const TrackOrder: React.FC = () => {
  const [reference, setReference] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !phone.trim()) {
      setError('Please provide both Order Reference and the Phone Number used during checkout.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const cleanRef = reference.trim().toUpperCase();
      // Try API first
      const res = await fetch(`/api/orders/${cleanRef}?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();

      if (res.ok && data.success && data.order) {
        setOrder(data.order);
      } else {
        // Fallback to local store
        const local = await getOrderByRef(cleanRef, phone.trim());
        if (local) {
          setOrder(local);
        } else {
          setError('No order found matching this reference and phone number. Please verify your reference or contact support.');
        }
      }
    } catch {
      const local = await getOrderByRef(reference.trim().toUpperCase(), phone.trim());
      if (local) {
        setOrder(local);
      } else {
        setError('Could not locate order. Please check the reference code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    const orderIndex: Record<string, number> = {
      pending_payment: 0,
      paid: 1,
      processing: 2,
      out_for_delivery: 3,
      delivered: 4,
    };

    const currentRank = orderIndex[currentStatus] || 0;
    const stepRank = orderIndex[stepKey] || 0;

    if (currentRank > stepRank) return 'completed';
    if (currentRank === stepRank) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E2A44]">
          Track Your Delivery
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Enter your order reference code (e.g. PT-20261012-XXXX) and phone number to monitor your package dispatch status.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 max-w-xl mx-auto shadow-xs">
        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
              Order Reference
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. PT-20261012-4F7K"
              className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] focus:bg-white text-[#1E2A44] font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
              Customer Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone used during checkout (e.g. 08124491537)"
              className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] focus:bg-white text-[#1E2A44]"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#DC2626] text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-[#1E2A44] hover:bg-[#1E2A44]/90 text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching Record...' : 'Track Order'}</span>
          </button>
        </form>
      </div>

      {/* Order Status Result */}
      {order && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-8 animate-in fade-in shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Order Details</span>
              <p className="font-mono text-xl font-bold text-[#1E2A44]">{order.reference}</p>
              <p className="text-xs text-[#64748B] mt-0.5">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-[#64748B]">Estimated Delivery Window</span>
              <p className="font-semibold text-sm text-[#1E2A44] flex items-center gap-1.5 sm:justify-end">
                <Truck className="w-4 h-4 text-[#E8553A]" />
                <span>5–7 Days Nationwide</span>
              </p>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="space-y-6">
            <h3 className="font-semibold text-xs text-[#1E2A44] uppercase tracking-wider">
              Shipment Progress
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
              {STATUS_STEPS.map((step, idx) => {
                const statusState = getStepStatus(step.key, order.status);
                return (
                  <div
                    key={step.key}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 transition-colors ${
                      statusState === 'completed'
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : statusState === 'current'
                        ? 'border-[#1E2A44] bg-[#F8FAFC] ring-2 ring-[#1E2A44]/10'
                        : 'border-[#E2E8F0] bg-white opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#64748B]">Step 0{idx + 1}</span>
                      {statusState === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : statusState === 'current' ? (
                        <Clock className="w-4 h-4 text-[#1E2A44] animate-spin" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-[#1E2A44]">{step.label}</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Destination & Items summary */}
          <div className="pt-6 border-t border-[#E2E8F0] grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-[#1E2A44] uppercase tracking-wider">Destination</span>
              <p className="text-[#1E2A44] font-medium">{order.customerName}</p>
              <p className="text-[#64748B]">{order.deliveryAddress}</p>
              <p className="text-[#64748B]">{order.deliveryCity}, {order.deliveryState} State</p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-[#1E2A44] uppercase tracking-wider">Items in Package</span>
              <ul className="space-y-1 text-[#64748B]">
                {order.items.map((it) => (
                  <li key={it.id}>
                    {it.quantity}x <strong className="text-[#1E2A44]">{it.productName}</strong>
                    {it.variantName && ` (${it.variantName})`}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* WhatsApp Support Callout */}
          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="text-[#64748B]">Have an inquiry regarding this dispatch?</span>
            <a
              href={`https://wa.me/2348124491537?text=${encodeURIComponent(
                `Hello Princely's Tech, I am inquiring about my order reference ${order.reference}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>Contact Dispatch on WhatsApp</span>
            </a>
          </div>

        </div>
      )}

    </div>
  );
};
