import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Headphones,
  Zap,
  BatteryCharging,
  CheckCircle2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Category, Product, SiteContent } from '../types';
import { getCategories, getProducts, getSiteContent, subscribeToStore } from '../services/store';
import { ProductCard } from '../components/ProductCard';
import { Testimonials } from '../components/Testimonials';
import { ScrollReveal } from '../components/ScrollReveal';
import { heroGadgetsImg, powerbankImg, chargerImg, earbudsImg } from '../data/initialData';

// Available Hero Featured Gadgets
const HERO_GADGETS = [
  {
    image: heroGadgetsImg,
    title: 'Curated Mobile Tech Essentials',
    category: 'Fast Charging, Audio & Accessories',
    price: 'From ₦5,500',
    slug: 'shop',
    link: '/shop',
  },
  {
    image: powerbankImg,
    title: 'Anker PowerCore 20,000mAh PD Fast Charge',
    category: 'Portable Power & Emergency Backup',
    price: '₦28,500',
    slug: 'anker-powercore-20000mah-pd-fast-charge-power-bank',
    link: '/product/anker-powercore-20000mah-pd-fast-charge-power-bank',
  },
  {
    image: chargerImg,
    title: '65W GaN Dual USB-C Fast Wall Charger',
    category: 'Overheat-Protected GaN Adapter',
    price: '₦18,500',
    slug: '65w-gan-dual-usbc-fast-wall-charger-adapter',
    link: '/product/65w-gan-dual-usbc-fast-wall-charger-adapter',
  },
  {
    image: earbudsImg,
    title: 'Sonic Pro Active Noise-Cancelling Earbuds',
    category: '36-Hour Battery HD Audio',
    price: '₦24,000',
    slug: 'sonic-pro-active-noise-cancelling-wireless-earbuds',
    link: '/product/sonic-pro-active-noise-cancelling-wireless-earbuds',
  },
];

export const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  // Hero Changing Gadget State
  const [activeGadgetIndex, setActiveGadgetIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const loadData = async () => {
    try {
      const [cats, prods, cnt] = await Promise.all([
        getCategories(),
        getProducts(),
        getSiteContent(),
      ]);
      setCategories(cats);
      setFeaturedProducts(prods.filter((p) => p.isFeatured).slice(0, 8));
      setContent(cnt);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return () => unsubscribe();
  }, []);

  // Auto-change hero image every 4 seconds unless hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveGadgetIndex((prev) => (prev + 1) % HERO_GADGETS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const nextHeroGadget = () => {
    setActiveGadgetIndex((prev) => (prev + 1) % HERO_GADGETS.length);
  };

  const prevHeroGadget = () => {
    setActiveGadgetIndex((prev) => (prev - 1 + HERO_GADGETS.length) % HERO_GADGETS.length);
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="bg-[#1E2A44] text-white rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-md">
          
          {/* Hero Copy */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#E8553A] uppercase tracking-wider">
              <span>Verified Store</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">Everyday Tech & Mobile Accessories</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-balance">
              {content?.heroHeadline || "Authentic Everyday Gadgets & Phone Accessories in Nigeria"}
            </h1>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-xl">
              {content?.heroSubtext || "Never worry about fake batteries or overheating chargers again. We test every power bank, charger, and cable for real durability before nationwide dispatch."}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="px-6 py-3.5 bg-[#E8553A] hover:bg-[#D14529] text-white font-semibold text-sm rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm whitespace-nowrap shrink-0 active:scale-95"
              >
                <span>Shop Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/2348124491537?text=Hello%20Princely's%20Tech%2C%20I%20want%20to%20order%20gadgets"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-lg transition-all duration-200 flex items-center gap-2 border border-white/15 whitespace-nowrap shrink-0 active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-[#E8553A]" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center gap-6 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tested Before Dispatch</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>5–7 Days Nationwide</span>
              </span>
            </div>
          </div>

          {/* Hero Visual Showcase with Auto-Rotating Gadgets */}
          <div
            className="lg:col-span-5 relative bg-slate-900 overflow-hidden min-h-[340px] sm:min-h-[420px] lg:min-h-full flex flex-col justify-end group select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Rotating Images Layer */}
            {HERO_GADGETS.map((gadget, idx) => (
              <div
                key={gadget.title}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === activeGadgetIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={gadget.image}
                  alt={gadget.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-102 transition-transform duration-700"
                />
              </div>
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-20 pointer-events-none" />

            {/* Carousel Navigation Arrows */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
              <button
                onClick={prevHeroGadget}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all duration-200 active:scale-90"
                aria-label="Previous gadget"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextHeroGadget}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all duration-200 active:scale-90"
                aria-label="Next gadget"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Active Gadget Floating Caption Overlay */}
            <div className="relative z-30 p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E8553A]">
                  {HERO_GADGETS[activeGadgetIndex].category}
                </span>
                <span className="text-xs font-bold text-white tabular-nums bg-white/20 px-2.5 py-0.5 rounded backdrop-blur-sm">
                  {HERO_GADGETS[activeGadgetIndex].price}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <h3 className="font-heading font-bold text-base sm:text-lg text-white leading-snug line-clamp-1">
                  {HERO_GADGETS[activeGadgetIndex].title}
                </h3>
                <Link
                  to={HERO_GADGETS[activeGadgetIndex].link}
                  className="px-3 py-1.5 bg-[#E8553A] hover:bg-[#D14529] text-white text-xs font-semibold rounded-md flex items-center gap-1 shrink-0 transition-colors shadow-sm"
                >
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Progress Pagination Indicator Dots */}
              <div className="flex items-center gap-2 pt-1">
                {HERO_GADGETS.map((g, idx) => (
                  <button
                    key={g.title}
                    onClick={() => setActiveGadgetIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeGadgetIndex ? 'w-6 bg-[#E8553A]' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`View gadget ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Strip */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#1E2A44] dark:text-[#E8553A]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-[#1E2A44] dark:text-white">Secure Paystack</p>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">Bank grade checkout</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-[#1E2A44] dark:text-[#E8553A]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-[#1E2A44] dark:text-white">5–7 Days Delivery</p>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">All 36 Nigerian states</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 text-[#1E2A44] dark:text-[#E8553A]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-[#1E2A44] dark:text-white">WhatsApp Support</p>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">08124491537 live chat</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-[#1E2A44] dark:text-[#E8553A]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-[#1E2A44] dark:text-white">Tested Quality</p>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">No fake capacities</p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 3. Category Grid */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1E2A44] dark:text-white">
                Shop by Category
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-1">
                Select your gadget type for guaranteed compatibility and specs
              </p>
            </div>
            <Link
              to="/shop"
              className="text-xs sm:text-sm font-semibold text-[#1E2A44] dark:text-slate-300 hover:text-[#E8553A] dark:hover:text-[#E8553A] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group p-5 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 hover:border-[#1E2A44] dark:hover:border-[#E8553A] rounded-xl transition-all duration-200 flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center text-[#1E2A44] dark:text-slate-200 group-hover:bg-[#1E2A44] dark:group-hover:bg-[#E8553A] group-hover:text-white transition-colors mb-3">
                    <BatteryCharging className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-[#1E2A44] dark:text-white group-hover:text-[#E8553A] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 pt-2 text-xs font-medium text-[#1E2A44] dark:text-slate-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Browse</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E8553A]" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* 4. Featured Products Grid */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1E2A44] dark:text-white">
                Featured & Best-Sellers
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-1">
                Popular fast chargers, high-capacity power banks, and audio gear
              </p>
            </div>
            <Link
              to="/shop"
              className="text-xs sm:text-sm font-semibold text-[#1E2A44] dark:text-slate-300 hover:text-[#E8553A] dark:hover:text-[#E8553A] flex items-center gap-1 transition-colors"
            >
              <span>See Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-72 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </ScrollReveal>

      {/* 5. Customer Testimonials Section */}
      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>

      {/* 6. "Why Shop With Princely's Tech" Section */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-8 sm:p-12 space-y-8">
            <div className="max-w-2xl">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E2A44] dark:text-white">
                {content?.whyChooseUsTitle || "Why Smartphone Users Trust Princely's Tech"}
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-400 mt-3 leading-relaxed">
                {content?.whyChooseUsBody || "In Nigeria, the tech accessory market is flooded with knock-offs that ruin phone batteries and stop working in 2 weeks. Princely's Tech was founded to eliminate that fear. Every product in our inventory is benchmarked for genuine wattage, authentic battery capacities, and physical durability."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-5 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl space-y-2">
                <p className="font-semibold text-sm text-[#1E2A44] dark:text-white">No Inflated Battery Specs</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                  If our label states 20,000mAh, it provides true 20,000mAh Lithium-Polymer cells that charge your phone multiple times.
                </p>
              </div>
              <div className="p-5 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl space-y-2">
                <p className="font-semibold text-sm text-[#1E2A44] dark:text-white">Overheat & Surge Protection</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                  Our GaN fast adapters feature intelligent thermal throttle to protect sensitive phone motherboards from Nigerian power fluctuations.
                </p>
              </div>
              <div className="p-5 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl space-y-2">
                <p className="font-semibold text-sm text-[#1E2A44] dark:text-white">6 Months Replacement Warranty</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                  In the rare event of a factory failure, we replace your item quickly without endless excuses.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 7. WhatsApp Direct Order Banner */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1E2A44] text-white rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <p className="text-xs uppercase font-semibold text-[#E8553A] tracking-wider">Fast WhatsApp Inquiries</p>
              <h3 className="font-heading text-xl sm:text-2xl font-bold">
                Prefer To Order Directly Via WhatsApp?
              </h3>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Message us your delivery location and items. Our team responds promptly with payment details and dispatch confirmation.
              </p>
            </div>
            <a
              href="https://wa.me/2348124491537?text=Hello%20Princely's%20Tech%2C%20I%20would%20like%20to%20order%20directly%20via%20WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold text-sm rounded-lg flex items-center gap-2 transition-all duration-200 whitespace-nowrap shrink-0 shadow-md active:scale-95"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Chat 08124491537</span>
            </a>
          </div>
        </section>
      </ScrollReveal>

    </div>
  );
};
