import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, RefreshCw, MessageCircle, ShoppingBag } from 'lucide-react';

export const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref') || '';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-[#DC2626] flex items-center justify-center mx-auto">
        <AlertCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E2A44]">
          Payment Was Not Completed
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
          The transaction was either cancelled by the bank, timed out, or interrupted. Your order has not been charged.
        </p>
        {ref && (
          <p className="text-xs text-[#64748B] pt-1">
            Reference: <span className="font-mono font-semibold text-[#1E2A44]">{ref}</span>
          </p>
        )}
      </div>

      <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#64748B] space-y-1.5 max-w-md mx-auto text-left">
        <p className="font-semibold text-[#1E2A44]">Possible reasons:</p>
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          <li>Insufficient funds or daily card limit reached</li>
          <li>Network timeout with bank OTP or USSD portal</li>
          <li>Card details or CVV entered incorrectly</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          to="/checkout"
          className="w-full sm:w-auto px-6 py-3 bg-[#E8553A] hover:bg-[#D14529] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Payment</span>
        </Link>
        <a
          href={`https://wa.me/2348124491537?text=${encodeURIComponent(
            `Hello Princely's Tech, my payment for reference ${ref || 'my order'} failed. Can I pay via direct bank transfer?`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3 bg-white border border-[#25D366] text-[#1E2A44] hover:bg-[#25D366]/5 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
          <span>Pay via Bank Transfer on WhatsApp</span>
        </a>
        <Link
          to="/shop"
          className="w-full sm:w-auto px-5 py-3 text-[#64748B] hover:text-[#1E2A44] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Return to Shop</span>
        </Link>
      </div>
    </div>
  );
};
