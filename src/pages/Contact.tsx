import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { saveContactMessage } from '../services/store';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    _hp: '', // Honeypot field
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Post to backend API / local store
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // Also persist to store
      await saveContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim() || 'General Inquiry',
        message: formData.message.trim(),
      });

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '', _hp: '' });
    } catch (err: any) {
      setError('Failed to send message. Please contact us directly on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#E8553A]">Customer Care</span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1E2A44]">
          Contact Princely's Tech
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Have a question about a product, delivery timeline, or your recent order? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Contact Channels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="font-heading text-lg font-bold text-[#1E2A44] pb-3 border-b border-[#E2E8F0]">
              Direct Contact Lines
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-[#25D366] flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <p className="font-semibold text-[#1E2A44]">WhatsApp Business</p>
                  <p className="text-[#64748B] text-xs">Fastest response time (9am – 8pm WAT)</p>
                  <a
                    href="https://wa.me/2348124491537"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E8553A] font-bold text-xs hover:underline mt-1 inline-block"
                  >
                    Chat +234 812 449 1537
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2A44] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#1E2A44]">Email Support</p>
                  <p className="text-[#64748B] text-xs">For bulk orders, invoices, and warranties</p>
                  <a
                    href="mailto:Princely4u112@gmail.com"
                    className="text-[#1E2A44] hover:text-[#E8553A] text-xs font-medium mt-1 inline-block"
                  >
                    Princely4u112@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2A44] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#1E2A44]">Phone Calls</p>
                  <p className="text-[#64748B] text-xs">Direct customer service line</p>
                  <p className="text-[#1E2A44] font-semibold text-xs mt-1 tabular-nums">08124491537</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E2A44] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#1E2A44]">Dispatch Hub</p>
                  <p className="text-[#64748B] text-xs">Nationwide Express Delivery (All 36 States)</p>
                  <p className="text-[#1E2A44] text-xs mt-1">Nigeria</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#1E2A44]">
              Send Us a Message
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Fill out the form below and our customer representative will get back to you promptly.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-semibold text-[#1E2A44] text-sm">Message Received Successfully!</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Thank you for reaching out. A member of the Princely's Tech team will review your message and reply via email or phone shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 bg-[#1E2A44] text-white text-xs font-semibold rounded-lg hover:bg-[#1E2A44]/90"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Invisible Honeypot Field */}
              <input
                type="text"
                name="_hp"
                value={formData._hp}
                onChange={(e) => setFormData({ ...formData, _hp: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-[#DC2626] text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                    Your Name <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Chukwuma Adeleke"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] focus:bg-white text-[#1E2A44]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                    Email Address <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] focus:bg-white text-[#1E2A44]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08124491537"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] focus:bg-white text-[#1E2A44]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                    Subject <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Product inquiry, Order status..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] focus:bg-white text-[#1E2A44]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                  Your Message <span className="text-[#DC2626]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist you today?"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] focus:bg-white text-[#1E2A44]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-[#E8553A] hover:bg-[#D14529] text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending Message...' : 'Submit Message'}</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
