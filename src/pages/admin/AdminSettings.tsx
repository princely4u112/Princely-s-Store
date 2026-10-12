import React, { useEffect, useState } from 'react';
import { Check, Settings, ShieldCheck } from 'lucide-react';
import { StoreSettings } from '../../types';
import { getStoreSettings, saveStoreSettings } from '../../services/store';

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
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="font-heading font-bold text-sm text-[#1E2A44] pb-2 border-b border-[#E2E8F0]">
            Nationwide Delivery Fees & Free Shipping Threshold
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Flat Delivery Fee (₦)
              </label>
              <input
                type="number"
                min={0}
                value={settings.deliveryFee}
                onChange={(e) => handleChange('deliveryFee', Number(e.target.value))}
                placeholder="2500"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#1E2A44]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Free Delivery Subtotal (₦)
              </label>
              <input
                type="number"
                min={0}
                value={settings.freeDeliveryThreshold}
                onChange={(e) => handleChange('freeDeliveryThreshold', Number(e.target.value))}
                placeholder="60000"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#1E2A44]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Delivery Window Label
              </label>
              <input
                type="text"
                value={settings.deliveryTime}
                onChange={(e) => handleChange('deliveryTime', e.target.value)}
                placeholder="5–7 days nationwide"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44]"
              />
            </div>
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
