import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const FloatingWhatsApp: React.FC = () => {
  const [dismissTooltip, setDismissTooltip] = useState(false);
  const location = useLocation();

  // If in admin dashboard, keep it unobtrusive
  const isAdmin = location.pathname.startsWith('/admin');

  const defaultGreeting = encodeURIComponent(
    "Hello Princely's Tech! I would like to make an inquiry about your gadgets and delivery."
  );

  return (
    <div
      className={`fixed z-30 transition-all duration-300 ${
        location.pathname === '/cart' || location.pathname === '/checkout'
          ? 'bottom-24 right-4 sm:bottom-8 sm:right-8'
          : 'bottom-6 right-4 sm:bottom-8 sm:right-8'
      }`}
    >
      <div className="relative group flex items-center animate-floating-hover">
        {/* Subtle tooltip banner (can be closed) */}
        {!dismissTooltip && !isAdmin && (
          <div className="hidden md:flex items-center gap-2 mr-3 px-3.5 py-2 bg-white dark:bg-slate-900 text-[#1E2A44] dark:text-white border border-[#E2E8F0] dark:border-slate-800 shadow-xl rounded-xl text-xs font-semibold animate-in fade-in duration-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Chat with Princely on WhatsApp</span>
            </span>
            <button
              onClick={() => setDismissTooltip(true)}
              className="text-[#64748B] hover:text-[#1E2A44] dark:hover:text-white ml-1 p-0.5 rounded transition-colors"
              aria-label="Dismiss WhatsApp hint"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* WhatsApp Action Button with hovering, pulsating aura */}
        <a
          href={`https://wa.me/2348124491537?text=${defaultGreeting}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-13 h-13 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 pulse-aura"
          aria-label="Chat with Princely's Tech on WhatsApp at 08124491537"
        >
          <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow-sm" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
        </a>
      </div>
    </div>
  );
};
