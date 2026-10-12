import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Headphones, CheckCircle2, ArrowRight } from 'lucide-react';
import { getSiteContent } from '../services/store';
import { SiteContent } from '../types';

export const About: React.FC = () => {
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    getSiteContent().then(setContent);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      
      {/* Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#E8553A]">About Our Business</span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1E2A44]">
          About Princely's Tech
        </h1>
        <p className="text-sm text-[#64748B] leading-relaxed">
          Your trusted Nigerian online store for everyday mobile gadgets and authentic phone accessories.
        </p>
      </div>

      {/* Main Narrative */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 space-y-6 text-sm text-[#1E2A44]/90 leading-relaxed shadow-xs">
        <h2 className="font-heading text-xl font-bold text-[#1E2A44]">
          Our Commitment to Nigerian Gadget Users
        </h2>

        <p>
          {content?.aboutText ||
            "Princely's Tech was founded out of a straightforward realization: the Nigerian mobile accessories market is saturated with counterfeit power banks, weak cables that fray within a fortnight, and overheating wall chargers that ruin expensive smartphone batteries."}
        </p>

        <p>
          Whether you are a student attending lectures, a corporate executive relying on continuous phone uptime, or a remote professional working through power outages, you deserve accessories that perform exactly as rated.
        </p>

        <p>
          At Princely's Tech, we don't drop-ship unverified inventory. Every power bank, fast charging brick, braided cable, tempered glass, and audio earbud in our warehouse undergoes physical bench testing for temperature safety, authentic milliamp-hour (mAh) capacity, and mechanical durability before it is cleared for dispatch.
        </p>

        <div className="pt-6 border-t border-[#E2E8F0] grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <ShieldCheck className="w-6 h-6 text-[#1E2A44]" />
            <h3 className="font-semibold text-sm text-[#1E2A44]">Quality Inspected</h3>
            <p className="text-xs text-[#64748B]">Zero fake capacities or exaggerated wattages. Real specs you can trust.</p>
          </div>
          <div className="space-y-1.5">
            <Truck className="w-6 h-6 text-[#1E2A44]" />
            <h3 className="font-semibold text-sm text-[#1E2A44]">5–7 Days Nationwide</h3>
            <p className="text-xs text-[#64748B]">Trackable courier delivery to Lagos, Abuja, Port Harcourt, and all 36 states.</p>
          </div>
          <div className="space-y-1.5">
            <Headphones className="w-6 h-6 text-[#1E2A44]" />
            <h3 className="font-semibold text-sm text-[#1E2A44]">Direct WhatsApp Support</h3>
            <p className="text-xs text-[#64748B]">Instant support and real human advice on WhatsApp at 08124491537.</p>
          </div>
        </div>
      </div>

      {/* Trust Checklist */}
      <div className="bg-[#1E2A44] text-white rounded-2xl p-6 sm:p-10 space-y-6">
        <h2 className="font-heading text-xl font-bold">
          The Princely's Tech Standard
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-white/80">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#E8553A] shrink-0 mt-0.5" />
            <span>Full 6-Month Replacement Warranty on power banks & chargers</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#E8553A] shrink-0 mt-0.5" />
            <span>Secure bank-level payment processing via Paystack</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#E8553A] shrink-0 mt-0.5" />
            <span>Overheat, over-voltage, and short-circuit protection circuits</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#E8553A] shrink-0 mt-0.5" />
            <span>7-Day Return & Exchange Guarantee for manufacturer defects</span>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap gap-4">
          <Link
            to="/shop"
            className="px-5 py-2.5 bg-[#E8553A] hover:bg-[#D14529] text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/contact"
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/20 transition-colors"
          >
            <span>Contact Support Desk</span>
          </Link>
        </div>
      </div>

    </div>
  );
};
