import React, { useEffect, useState } from 'react';
import { Star, ShieldCheck, Quote, ChevronLeft, ChevronRight, CheckCircle2, MessageSquarePlus, X, Send } from 'lucide-react';
import { CustomerReview } from '../types';
import { getReviews, saveReview, subscribeToStore } from '../services/store';

export const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    verifiedProduct: 'Anker PowerCore 20,000mAh PD Power Bank',
    rating: 5,
    quote: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const list = await getReviews(true);
    setReviews(list);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStore(loadData);
    return () => unsub();
  }, []);

  const nextTestimonial = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevTestimonial = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quote.trim()) {
      setFormError('Please enter your name and write your review feedback.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await saveReview({
        name: formData.name.trim(),
        location: formData.location.trim() || 'Lagos, Nigeria',
        verifiedProduct: formData.verifiedProduct.trim(),
        rating: formData.rating,
        quote: formData.quote.trim(),
        isPublished: true, // auto-publish, editable by admin in dashboard
      });

      setSubmittedSuccess(true);
      setFormData({
        name: '',
        location: '',
        verifiedProduct: 'Anker PowerCore 20,000mAh PD Power Bank',
        rating: 5,
        quote: '',
      });
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmittedSuccess(false);
      }, 2500);
    } catch {
      setFormError('Failed to save review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E8553A] mb-1.5">
            <ShieldCheck className="w-4 h-4 text-[#E8553A]" />
            <span>Verified Customer Experiences</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E2A44] dark:text-white">
            Trusted by Gadget Users Across Nigeria
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-1 max-w-xl">
            Real feedback from buyers who solved the problem of fake capacities, slow charging, and unreliable sellers.
          </p>
        </div>

        {/* Action Controls: Write Review Button & Carousel Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#E8553A] hover:bg-[#D14529] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all duration-200 active:scale-95 shadow-sm"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Drop a Review</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-lg border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-[#F8FAFC] dark:hover:bg-slate-700 text-[#1E2A44] dark:text-slate-200 transition-all duration-200 active:scale-95"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-lg border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-[#F8FAFC] dark:hover:bg-slate-700 text-[#1E2A44] dark:text-slate-200 transition-all duration-200 active:scale-95"
              aria-label="Next review"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {reviews.slice(0, 4).map((t, idx) => {
          const isHighlighted = idx === currentIndex;
          return (
            <div
              key={t.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 ${
                isHighlighted
                  ? 'border-[#1E2A44] dark:border-[#E8553A] shadow-md ring-1 ring-[#1E2A44]/10 -translate-y-1'
                  : 'border-[#E2E8F0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                {/* Rating stars & Quote mark */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                </div>

                {/* Verified Purchase badge */}
                <div className="text-[11px] text-[#64748B] dark:text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate font-medium text-emerald-700 dark:text-emerald-400">Verified: {t.verifiedProduct}</span>
                </div>

                {/* Quote Prose */}
                <p className="text-xs sm:text-sm text-[#1E2A44]/90 dark:text-slate-200 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Author attribution */}
              <div className="pt-4 mt-4 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1E2A44] dark:bg-slate-800 text-white flex items-center justify-center font-heading font-bold text-xs shrink-0 border border-white/10">
                  {t.avatarInitials || t.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-[#1E2A44] dark:text-white truncate">{t.name}</p>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                    {t.role || 'Verified Customer'} · {t.location}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Aggregate trust proof band */}
      <div className="bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] dark:text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-semibold text-[#1E2A44] dark:text-white tabular-nums">4.9 / 5.0 Average Rating</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>Over 280+ verified nationwide dispatches across Nigeria</span>
        </div>

        <div className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Every gadget verified before dispatch</span>
        </div>
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-[#E2E8F0] dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E8553A]">Customer Feedback</span>
              <h3 className="font-heading font-extrabold text-xl text-[#1E2A44] dark:text-white mt-0.5">
                Drop Your Verified Review
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                Share your honest experience with your gadget, charging speed, battery longevity, or nationwide delivery.
              </p>
            </div>

            {submittedSuccess ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="font-semibold text-sm text-[#1E2A44] dark:text-white">Review Submitted Successfully!</h4>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Thank you for sharing your experience with Princely's Tech. Your review is now live on our store!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-lg">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E2A44] dark:text-slate-200 mb-1">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Chukwuma Adeleke"
                      className="w-full px-3 py-2 text-xs bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[#1E2A44] dark:text-white focus:outline-none focus:border-[#1E2A44]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1E2A44] dark:text-slate-200 mb-1">
                      City / Location in Nigeria <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Ikeja, Lagos or Abuja"
                      className="w-full px-3 py-2 text-xs bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[#1E2A44] dark:text-white focus:outline-none focus:border-[#1E2A44]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2A44] dark:text-slate-200 mb-1">
                    Gadget / Product Purchased <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.verifiedProduct}
                    onChange={(e) => setFormData({ ...formData, verifiedProduct: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[#1E2A44] dark:text-white focus:outline-none focus:border-[#1E2A44]"
                  >
                    <option value="Anker PowerCore 20,000mAh PD Power Bank">Anker PowerCore 20,000mAh PD Power Bank</option>
                    <option value="65W GaN Dual USB-C Fast Wall Charger">65W GaN Dual USB-C Fast Wall Charger</option>
                    <option value="Sonic Pro ANC Wireless Earbuds">Sonic Pro ANC Wireless Earbuds</option>
                    <option value="Heavy-Duty 100W Braided USB-C Cable">Heavy-Duty 100W Braided USB-C Cable</option>
                    <option value="3-in-1 Fast Charging Nylon Cable">3-in-1 Fast Charging Nylon Cable</option>
                    <option value="Military-Grade Shockproof Magnetic Case">Military-Grade Shockproof Magnetic Case</option>
                    <option value="9H Full Coverage Tempered Glass (2-Pack)">9H Full Coverage Tempered Glass (2-Pack)</option>
                    <option value="Adjustable Aluminum Phone & Tablet Stand">Adjustable Aluminum Phone & Tablet Stand</option>
                    <option value="Tecno Spark 20 Pro (256GB / 8GB RAM)">Tecno Spark 20 Pro (256GB / 8GB RAM)</option>
                    <option value="Samsung Galaxy A15 (128GB / 6GB RAM)">Samsung Galaxy A15 (128GB / 6GB RAM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2A44] dark:text-slate-200 mb-1.5">
                    Your Rating: {formData.rating} Stars
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= formData.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2A44] dark:text-slate-200 mb-1">
                    Your Feedback Quote <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    placeholder="Tell other buyers how the battery holds up, charging speed, packaging, or how fast it arrived..."
                    className="w-full px-3 py-2 text-xs bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[#1E2A44] dark:text-white focus:outline-none focus:border-[#1E2A44]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#E8553A] hover:bg-[#D14529] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Post Verified Review'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </section>
  );
};
