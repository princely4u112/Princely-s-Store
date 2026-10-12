import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#E8553A]">Data Protection</span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1E2A44]">
          Privacy Policy (NDPA / NDPR Compliant)
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Effective Date: October 2026 · Princely's Tech Nigeria
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 space-y-8 text-sm text-[#1E2A44]/90 leading-relaxed shadow-xs">
        
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#E8553A]" />
            <span>1. Our Privacy Pledge</span>
          </h2>
          <p>
            Princely's Tech is committed to safeguarding the personal information of all visitors and customers in compliance with the Nigeria Data Protection Act (NDPA) and NDPR guidelines. We collect only what is strictly necessary to process your orders and coordinate delivery.
          </p>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#E2E8F0]">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44]">
            2. Information We Collect
          </h2>
          <p>When you place an order on our store, we collect:</p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-[#64748B] pl-2">
            <li>Your full name for parcel addressing</li>
            <li>Your telephone number so dispatch couriers can reach you for delivery</li>
            <li>Your email address for order receipts and confirmation</li>
            <li>Your residential or office delivery address, city, and state</li>
          </ul>
          <p className="text-xs text-[#64748B] mt-2">
            <strong>Payment Security Note:</strong> We NEVER collect, process, or store your debit card number, expiration date, or CVV. All payments are tokenized and processed directly by Paystack through TLS encrypted channels.
          </p>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#E2E8F0]">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44]">
            3. How Your Information is Used
          </h2>
          <p>
            Your information is exclusively used for order fulfillment, fraud prevention, delivery tracking updates, and customer support. We never sell, rent, or trade your personal data to marketing brokers or third parties.
          </p>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#E2E8F0]">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44]">
            4. Data Retention & Contact
          </h2>
          <p>
            You may request the correction or deletion of your customer records by contacting our data compliance officer at <strong>Princely4u112@gmail.com</strong>.
          </p>
        </div>

      </div>

    </div>
  );
};
