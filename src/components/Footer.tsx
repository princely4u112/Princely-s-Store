import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone, ShieldCheck, Truck, Clock, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Footer: React.FC = () => {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <footer className="bg-[#1E2A44] dark:bg-slate-950 text-[#F8FAFC] border-t border-[#1E2A44]/10 dark:border-slate-800 pt-16 pb-12 mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Value Assurance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-white/10 text-sm">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#E8553A] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">5–7 Days Nationwide Delivery</p>
              <p className="text-white/70 text-xs mt-0.5">Reliable dispatch to Lagos, Abuja, Port Harcourt, and all 36 states.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#E8553A] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Verified Authentic Tech</p>
              <p className="text-white/70 text-xs mt-0.5">All chargers, power banks, and cables are tested for heat safety & genuine specs.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#E8553A] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">6 Months Store Warranty</p>
              <p className="text-white/70 text-xs mt-0.5">Hassle-free replacement for any manufacturer defect or charging failure.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#E8553A] flex items-center justify-center text-white font-heading font-extrabold text-sm">
                P
              </div>
              <span className="font-heading font-bold text-lg text-white">Princely's Tech</span>
            </div>
            <p className="text-sm text-white/70 max-w-sm leading-relaxed">
              Your trusted Nigerian online store for genuine everyday gadgets and mobile accessories. Solving the fear of low-quality knockoffs and unsafe chargers with tested, durable products.
            </p>
            <div className="pt-2 text-xs text-white/60 space-y-1.5">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E8553A]" />
                <span className="tabular-nums">08124491537</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#E8553A]" />
                <span>Princely4u112@gmail.com</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-white/40">Shop Catalog</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/category/power-banks" className="hover:text-white transition-colors">Power Banks</Link>
              </li>
              <li>
                <Link to="/category/chargers-adapters" className="hover:text-white transition-colors">Fast Chargers</Link>
              </li>
              <li>
                <Link to="/category/usb-cables" className="hover:text-white transition-colors">USB Cables</Link>
              </li>
              <li>
                <Link to="/category/cases-screen-guards" className="hover:text-white transition-colors">Cases & Protectors</Link>
              </li>
              <li>
                <Link to="/category/audio-earphones" className="hover:text-white transition-colors">Earphones & Audio</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-white/40">Customer Support</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors">Track Your Order</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Our Business</Link>
              </li>
              <li>
                <a
                  href="https://wa.me/2348124491537?text=Hello%20Princely's%20Tech%2C%20I%20need%20help%20with%20an%20order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#E8553A]" />
                  <span>WhatsApp Live Chat</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-white/40">Store Policies</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link to="/delivery-policy" className="hover:text-white transition-colors">Delivery Policy (5–7 Days)</Link>
              </li>
              <li>
                <Link to="/returns-policy" className="hover:text-white transition-colors">Returns & Refunds</Link>
              </li>
              <li>
                <Link to="/warranty" className="hover:text-white transition-colors">Warranty Terms</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy (NDPR)</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Dark/Light Mode Theme Button & Payment Security */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-white/70">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p>© {new Date().getFullYear()} Princely's Tech. All rights reserved. Nigeria.</p>
          </div>

          {/* Dark Mode & Light Mode Theme Switcher */}
          <div className="flex items-center gap-2 bg-white/10 dark:bg-white/5 border border-white/15 rounded-lg p-1">
            <span className="text-[11px] font-medium text-white/60 px-2">Theme:</span>
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
                theme === 'light'
                  ? 'bg-white text-[#1E2A44] shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Switch to Light Mode"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-[#E8553A] text-white shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Switch to Dark Mode"
            >
              <Moon className="w-3.5 h-3.5 text-white" />
              <span>Dark</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-white/70">
            <span>Secured with Paystack</span>
            <span>·</span>
            <span>Debit Cards</span>
            <span>·</span>
            <span>Bank Transfer</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
