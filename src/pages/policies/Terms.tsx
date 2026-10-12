import React from 'react';
import { FileText } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#E8553A]">Legal Terms</span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1E2A44]">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Effective Date: October 2026 · Princely's Tech Nigeria
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 space-y-8 text-sm text-[#1E2A44]/90 leading-relaxed shadow-xs">
        
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#E8553A]" />
            <span>1. Agreement to Terms</span>
          </h2>
          <p>
            By accessing or purchasing from Princely's Tech ("princelystech.ng"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.
          </p>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#E2E8F0]">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44]">
            2. Product Pricing & Currency
          </h2>
          <p>
            All prices listed on our platform are denominated in Nigerian Naira (₦). While we make every effort to ensure accurate pricing, we reserve the right to correct genuine typographical errors prior to shipping confirmation.
          </p>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#E2E8F0]">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44]">
            3. Order Acceptance & Inventory
          </h2>
          <p>
            An order is accepted and a binding contract formed once your payment has been verified and an official Order Reference code is issued. In the rare event an item is out of stock due to simultaneous orders, we will notify you immediately and issue a full refund or suitable alternative.
          </p>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#E2E8F0]">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44]">
            4. Governing Law
          </h2>
          <p>
            These terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
          </p>
        </div>

      </div>

    </div>
  );
};
