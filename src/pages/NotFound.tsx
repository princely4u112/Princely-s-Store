import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShoppingBag, MessageCircle, AlertCircle } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-slate-100 border border-[#E2E8F0] text-[#1E2A44] flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8 text-[#E8553A]" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Error 404</span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1E2A44]">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
          The gadget page or link you requested does not exist or has been relocated.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3 bg-[#1E2A44] hover:bg-[#1E2A44]/90 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/shop"
          className="w-full sm:w-auto px-6 py-3 bg-[#E8553A] hover:bg-[#D14529] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Store Catalog</span>
        </Link>
        <a
          href="https://wa.me/2348124491537?text=Hello%20Princely's%20Tech%2C%20I%20hit%20a%20broken%20link%20on%20your%20site"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3 bg-white border border-[#25D366] text-[#1E2A44] hover:bg-[#25D366]/5 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
          <span>Ask on WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
