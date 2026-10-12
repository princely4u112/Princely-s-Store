import React from 'react';
import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';

export const DeliveryPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#E8553A]">Shipping Guidelines</span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1E2A44]">
          Nationwide Delivery Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Effective Date: October 2026 · Princely's Tech Nigeria
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 space-y-8 text-sm text-[#1E2A44]/90 leading-relaxed shadow-xs">
        
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#E8553A]" />
            <span>1. Estimated Delivery Timelines (5–7 Days Nationwide)</span>
          </h2>
          <p>
            At Princely's Tech, all orders are processed, bench-tested, and dispatched within <strong>24 hours</strong> of payment verification. 
            Standard transit time across Nigeria is <strong>5 to 7 business days</strong> nationwide.
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-[#64748B] pl-2">
            <li><strong>Lagos & South-West Metropolis:</strong> 2 to 4 business days</li>
            <li><strong>Abuja (FCT) & North-Central:</strong> 3 to 5 business days</li>
            <li><strong>Port Harcourt & South-South / South-East:</strong> 4 to 6 business days</li>
            <li><strong>Northern States & Remote Locations:</strong> 5 to 7 business days</li>
          </ul>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#E2E8F0]">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#E8553A]" />
            <span>2. Nationwide Shipping Rates</span>
          </h2>
          <p>
            We maintain a flat-rate nationwide shipping fee of <strong>₦2,500</strong> for all deliveries across all 36 states and the Federal Capital Territory.
          </p>
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold">
            Free Nationwide Shipping: All orders with a subtotal of ₦60,000 or above automatically qualify for 100% free delivery nationwide.
          </div>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#E2E8F0]">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#E8553A]" />
            <span>3. Packaging & Parcel Protection</span>
          </h2>
          <p>
            Lithium-ion power banks and delicate electronics are wrapped in industrial shock-absorbent bubble cushioning and tamper-evident courier bags to guard against impacts or weather elements during transit.
          </p>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#E2E8F0]">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#E8553A]" />
            <span>4. Delivery Confirmation & Courier Contact</span>
          </h2>
          <p>
            Upon arrival in your state hub, our delivery dispatch driver will contact the customer phone number provided during checkout. Please ensure your line is reachable to avoid failed delivery attempts.
          </p>
          <p className="text-xs text-[#64748B]">
            For dispatch inquiries, track your order on our website or reach out directly on WhatsApp at <strong>08124491537</strong>.
          </p>
        </div>

      </div>

    </div>
  );
};
