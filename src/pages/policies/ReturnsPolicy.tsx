import React from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ReturnsPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#E8553A]">Returns & Refunds</span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1E2A44]">
          7-Day Return & Exchange Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Effective Date: October 2026 · Princely's Tech Nigeria
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 space-y-8 text-sm text-[#1E2A44]/90 leading-relaxed shadow-xs">
        
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44] flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#E8553A]" />
            <span>1. 7-Day Inspection Window</span>
          </h2>
          <p>
            We stand behind every gadget we sell. If you receive an item that is defective, incompatible, or differs from the product description on our website, you have <strong>7 calendar days</strong> from the date of physical delivery to request an exchange or refund.
          </p>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#E2E8F0]">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>2. Return Eligibility Criteria</span>
          </h2>
          <p>To qualify for a prompt exchange or full refund:</p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-[#64748B] pl-2">
            <li>The item must be in its original condition with all accessories, cables, and packaging intact.</li>
            <li>Proof of purchase (Order Reference code e.g. PT-20261012-XXXX) must be presented.</li>
            <li>The fault must be verified as a manufacturer defect, not caused by water ingress, physical drops, or electrical surge burns.</li>
          </ul>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#E2E8F0]">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>3. How to Initiate a Return</span>
          </h2>
          <p>
            Contact our customer care line on WhatsApp at <strong>08124491537</strong> or email <strong>Princely4u112@gmail.com</strong> with your order reference and a brief video or photo demonstrating the defect.
          </p>
          <p>
            Once verified by our tech team, we will coordinate pickup or provide the return address. Replacement items are dispatched immediately at our cost.
          </p>
        </div>

      </div>

    </div>
  );
};
