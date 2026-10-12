import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, MessageCircle, Sun, Moon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Triple-tap detection for secret admin access
  const clickTimestamps = useRef<number[]>([]);

  const handleLogoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const timestamps = clickTimestamps.current.filter((t) => now - t <= 800);
    timestamps.push(now);
    clickTimestamps.current = timestamps;

    if (timestamps.length >= 3) {
      e.preventDefault();
      clickTimestamps.current = [];
      navigate('/admin/login');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Main Sticky Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          
          {/* Zone 1: Brand Wordmark (Triple-click secret trigger) */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="group flex items-center gap-2 select-none shrink-0"
            title="Princely's Tech - Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1E2A44] dark:bg-[#E8553A] flex items-center justify-center text-white font-heading font-extrabold text-base tracking-tight group-hover:bg-[#E8553A] transition-colors">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg sm:text-xl tracking-tight text-[#1E2A44] dark:text-white whitespace-nowrap">
                Princely's Tech
              </span>
            </div>
          </Link>

          {/* Zone 2: Navigation Links (single-line, clean text links) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B] dark:text-slate-300">
            <Link to="/shop" className="hover:text-[#1E2A44] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Shop All
            </Link>
            <Link to="/category/power-banks" className="hover:text-[#1E2A44] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Power Banks
            </Link>
            <Link to="/category/chargers-adapters" className="hover:text-[#1E2A44] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Chargers & Adapters
            </Link>
            <Link to="/track-order" className="hover:text-[#1E2A44] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Track Order
            </Link>
            <Link to="/about" className="hover:text-[#1E2A44] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              About
            </Link>
            <Link to="/contact" className="hover:text-[#1E2A44] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Contact
            </Link>
          </nav>

          {/* Zone 3: Actions (Theme Toggle, Search, Cart, WhatsApp CTA) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[#64748B] dark:text-slate-300 hover:text-[#1E2A44] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-slate-700" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
            </button>

            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#64748B] dark:text-slate-300 hover:text-[#1E2A44] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Search store"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 text-[#1E2A44] dark:text-slate-200 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center"
              aria-label={`Shopping Cart with ${itemCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E8553A] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center tabular-nums">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Direct WhatsApp Assistance Action */}
            <a
              href="https://wa.me/2348124491537?text=Hello%20Princely's%20Tech%2C%20I%20would%20like%20to%20inquire%20about%20ordering%20gadgets"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#E8553A] hover:bg-[#D14529] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order on WhatsApp</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#1E2A44] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Drawer */}
        {searchOpen && (
          <div className="border-t border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 py-3 px-4 sm:px-6 shadow-sm animate-in fade-in duration-150">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-[#64748B] dark:text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search power banks, 65W chargers, iPhone cases, cables, earbuds..."
                  className="w-full pl-10 pr-24 py-2.5 text-sm bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E2A44] dark:focus:border-slate-400 focus:bg-white dark:focus:bg-slate-800 text-[#1E2A44] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1.5 bg-[#1E2A44] dark:bg-[#E8553A] text-white text-xs font-semibold rounded-md hover:opacity-90 transition-opacity"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-[#64748B] dark:text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[#1E2A44] dark:text-white"
              />
            </form>
            <div className="flex flex-col space-y-2 pt-2 text-sm font-medium text-[#1E2A44] dark:text-slate-200">
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-slate-800"
              >
                Shop All Products
              </Link>
              <Link
                to="/category/power-banks"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-slate-800"
              >
                Power Banks
              </Link>
              <Link
                to="/category/chargers-adapters"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-slate-800"
              >
                Chargers & Adapters
              </Link>
              <Link
                to="/category/usb-cables"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-slate-800"
              >
                USB Cables
              </Link>
              <Link
                to="/category/audio-earphones"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-slate-800"
              >
                Audio & Earphones
              </Link>
              <Link
                to="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-slate-800"
              >
                Track Order
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-slate-800"
              >
                About Princely's Tech
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-slate-800"
              >
                Contact Support
              </Link>
            </div>
            <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-800 space-y-2">
              <button
                onClick={() => {
                  toggleTheme();
                }}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-[#F8FAFC] dark:bg-slate-800 text-xs font-semibold text-[#1E2A44] dark:text-white"
              >
                <span className="flex items-center gap-2">
                  {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-white" />}
                  <span>Appearance Theme</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-[11px] capitalize border border-[#E2E8F0] dark:border-slate-600">
                  {theme} Mode
                </span>
              </button>

              <a
                href="https://wa.me/2348124491537"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#E8553A] text-white text-sm font-semibold rounded-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
