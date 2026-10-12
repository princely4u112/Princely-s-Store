import React from 'react';
import { ShieldCheck, Check, AlertCircle } from 'lucide-react';

export const WarrantyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#E8553A]">Protection Terms</span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1E2A44]">
          6-Month Store Warranty
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Effective Date: October 2026 · Princely's Tech Nigeria
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 space-y-8 text-sm text-[#1E2A44]/90 leading-relaxed shadow-xs">
        
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#E8553A]" />
            <span>1. Warranty Scope & Coverage</span>
          </h2>
          <p>
            Every power bank, fast wall charger, and electronic audio accessory sold by Princely's Tech is protected by our standard <strong>6-Month Limited Store Warranty</strong>.
            New smartphones (Samsung, Tecno, Apple, etc.) include official 12 to 24 month manufacturer warranties serviceable at authorized service centers across Nigeria (such as Carlcare and Samsung Care).
          </p>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#E2E8F0]">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44] flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>2. What is Covered</span>
          </h2>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-[#64748B] pl-2">
            <li>Internal battery cell degradation or sudden inability to hold charge under normal operating temperatures.</li>
            <li>Failure of fast-charging Power Delivery (PD) or Quick Charge (QC) controller circuits.</li>
            <li>Wireless earbud speaker failure, driver distortion, or Bluetooth sync disconnection.</li>
            <li>Internal wiring separation on heavy-duty braided cables.</li>
          </ul>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#E2E8F0]">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44] flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#DC2626]" />
            <span>3. What is Excluded</span>
          </h2>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-[#64748B] pl-2">
            <li>Physical impact damage, cracked casings, and broken connector pins caused by drops or force.</li>
            <li>Water immersion, rain exposure, or corrosion.</li>
            <li>Unauthorized disassembly, tampering, or third-party repair attempts.</li>
          </ul>
        </div>

        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-1">
          <p className="font-semibold text-[#1E2A44]">Need to make a warranty claim?</p>
          <p className="text-[#64748B]">
            Simply reach out to our support WhatsApp line at <strong>08124491537</strong> with your Order Reference number. We honor our warranty commitment quickly.
          </p>
        </div>

      </div>

    </div>
  );
};
