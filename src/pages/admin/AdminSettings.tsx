import React, { useEffect, useState } from 'react';
import { Check, Settings, ShieldCheck, Truck, Gift, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { StoreSettings } from '../../types';
import { getStoreSettings, saveStoreSettings } from '../../services/store';
import { formatNaira } from '../../utils/formatters';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getStoreSettings().then(setSettings);
  }, []);

  const handleChange = (field: keyof StoreSettings, val: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: val });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    await saveStoreSettings(settings);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (!settings) {
    return <div className="p-8 text-xs text-[#64748B]">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E2A44]">
            Store & Contact Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Manage your store's WhatsApp number, shipping fees, support emails, and dispatch threshold
          </p>
        </div>

        {success && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg animate-in fade-in">
            ✓ Settings saved successfully
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Contact Information */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="font-heading font-bold text-sm text-[#1E2A44] pb-2 border-b border-[#E2E8F0]">
            Customer Support & WhatsApp Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                WhatsApp Business Number (International Format)
              </label>
              <input
                type="text"
                required
                value={settings.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="2348124491537"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#1E2A44]"
              />
              <p className="text-[10px] text-[#64748B] mt-0.5">Used in all wa.me/ links across the website</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Display Phone Number (For Local Callers)
              </label>
              <input
                type="text"
                required
                value={settings.displayPhone}
                onChange={(e) => handleChange('displayPhone', e.target.value)}
                placeholder="08124491537"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#1E2A44]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Official Support Email
              </label>
              <input
                type="email"
                required
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                placeholder="Princely4u112@gmail.com"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Store Brand Name
              </label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                placeholder="Princely's Tech"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Physical Dispatch Hub / Warehouse Address
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Shop 14, Gadget Plaza, Computer Village / Nationwide Express Dispatch, Nigeria"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44]"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Controls */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
            <div>
              <h2 className="font-heading font-bold text-sm text-[#1E2A44] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#E8553A]" />
                <span>Nationwide Shipping & Free Shipping Configuration</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Set any custom shipping fee, activate nationwide 100% free delivery, or establish free shipping cart thresholds.
              </p>
            </div>
            {settings.deliveryFee === 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                100% Free Shipping Active
              </span>
            )}
          </div>

          {/* Mode Selector: Free Shipping vs Flat/Custom Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                handleChange('deliveryFee', 0);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                settings.deliveryFee === 0
                  ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                  : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-slate-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                settings.deliveryFee === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                <Gift className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E2A44]">100% Free Shipping Everywhere</span>
                  {settings.deliveryFee === 0 && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Set delivery fee to ₦0 on all orders regardless of cart amount.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (settings.deliveryFee === 0) {
                  handleChange('deliveryFee', 2500);
                }
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                settings.deliveryFee > 0
                  ? 'border-[#E8553A] bg-orange-50/30 ring-2 ring-[#E8553A]/20'
                  : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-slate-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                settings.deliveryFee > 0 ? 'bg-[#E8553A] text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                <Truck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E2A44]">Custom / Flat Shipping Fee</span>
                  {settings.deliveryFee > 0 && (
                    <CheckCircle2 className="w-4 h-4 text-[#E8553A]" />
                  )}
                </div>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Charge a fixed fee (e.g. ₦2,500), with optional free shipping above a threshold.
                </p>
              </div>
            </button>
          </div>

          {/* Detailed Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Flat Delivery Fee */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#1E2A44]">
                  Nationwide Delivery Fee (₦)
                </label>
                {settings.deliveryFee === 0 ? (
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Free</span>
                ) : (
                  <span className="text-[10px] font-mono text-[#64748B]">{formatNaira(settings.deliveryFee)}</span>
                )}
              </div>
              <input
                type="number"
                min={0}
                step={100}
                value={settings.deliveryFee}
                onChange={(e) => handleChange('deliveryFee', Math.max(0, Number(e.target.value) || 0))}
                placeholder="2500"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#1E2A44] focus:bg-white focus:border-[#E8553A] focus:outline-none"
              />
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[0, 1500, 2000, 2500, 3500, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleChange('deliveryFee', val)}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                      settings.deliveryFee === val
                        ? 'bg-[#1E2A44] text-white border-[#1E2A44] font-bold'
                        : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-slate-400'
                    }`}
                  >
                    {val === 0 ? 'Free (₦0)' : `₦${val.toLocaleString()}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Free Delivery Subtotal Threshold */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#1E2A44]">
                  Free Delivery Cart Threshold (₦)
                </label>
                {settings.freeDeliveryThreshold > 0 ? (
                  <span className="text-[10px] font-mono text-[#64748B]">{formatNaira(settings.freeDeliveryThreshold)}</span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-500">Disabled</span>
                )}
              </div>
              <input
                type="number"
                min={0}
                step={5000}
                value={settings.freeDeliveryThreshold}
                onChange={(e) => handleChange('freeDeliveryThreshold', Math.max(0, Number(e.target.value) || 0))}
                placeholder="60000"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#1E2A44] focus:bg-white focus:border-[#E8553A] focus:outline-none"
              />
              {/* Threshold Presets */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[0, 40000, 50000, 60000, 80000, 100000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleChange('freeDeliveryThreshold', val)}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                      settings.freeDeliveryThreshold === val
                        ? 'bg-[#1E2A44] text-white border-[#1E2A44] font-bold'
                        : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-slate-400'
                    }`}
                  >
                    {val === 0 ? 'Off (₦0)' : `₦${(val / 1000).toFixed(0)}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Window Label */}
            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Estimated Delivery Window Label
              </label>
              <input
                type="text"
                value={settings.deliveryTime}
                onChange={(e) => handleChange('deliveryTime', e.target.value)}
                placeholder="5–7 days nationwide"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44] focus:bg-white focus:border-[#E8553A] focus:outline-none"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['5–7 days nationwide', '2–4 business days', '3–5 days nationwide'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleChange('deliveryTime', label)}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                      settings.deliveryTime === label
                        ? 'bg-[#1E2A44] text-white border-[#1E2A44]'
                        : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Customer Impact Simulation Box */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-[#1E2A44]">
              <Info className="w-3.5 h-3.5 text-[#E8553A] shrink-0" />
              <span>Live Customer Checkout Experience Preview:</span>
            </div>
            {settings.deliveryFee === 0 ? (
              <p className="text-emerald-700 bg-emerald-50/80 border border-emerald-200 p-2.5 rounded text-xs font-medium">
                🎉 <strong>Free shipping nationwide active!</strong> Every customer sees <strong>FREE delivery (₦0)</strong> at cart and checkout, regardless of order amount.
              </p>
            ) : settings.freeDeliveryThreshold > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white rounded border border-[#E2E8F0]">
                  <span className="text-[#64748B] block text-[11px]">Orders below {formatNaira(settings.freeDeliveryThreshold)}:</span>
                  <span className="font-bold text-[#1E2A44]">
                    Customer pays flat {formatNaira(settings.deliveryFee)} delivery fee
                  </span>
                </div>
                <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                  <span className="text-emerald-700 block text-[11px]">Orders reaching {formatNaira(settings.freeDeliveryThreshold)}+:</span>
                  <span className="font-bold text-emerald-800">
                    Customer receives 100% FREE delivery
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[#64748B] bg-white border border-[#E2E8F0] p-2.5 rounded text-xs">
                Flat shipping fee of <strong>{formatNaira(settings.deliveryFee)}</strong> is charged on all orders across all 36 states (no free delivery threshold active).
              </p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#E8553A] hover:bg-[#D14529] text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Store Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
