import React, { useEffect, useState } from 'react';
import { Check, FileText } from 'lucide-react';
import { SiteContent } from '../../types';
import { getSiteContent, saveSiteContent } from '../../services/store';

export const AdminContent: React.FC = () => {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getSiteContent().then(setContent);
  }, []);

  const handleChange = (field: keyof SiteContent, val: string) => {
    if (!content) return;
    setContent({ ...content, [field]: val });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    await saveSiteContent(content);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (!content) {
    return <div className="p-8 text-xs text-[#64748B]">Loading content settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E2A44]">
            Website Copy & Content
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Update headlines, why choose us narrative, and store policies in real-time
          </p>
        </div>

        {success && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg animate-in fade-in">
            ✓ Content updated successfully
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Homepage Hero Box */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="font-heading font-bold text-sm text-[#1E2A44] pb-2 border-b border-[#E2E8F0]">
            Homepage Hero Headline & Subtext
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
              Main Hero Headline
            </label>
            <input
              type="text"
              value={content.heroHeadline}
              onChange={(e) => handleChange('heroHeadline', e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44] font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
              Hero Subtext
            </label>
            <textarea
              rows={2}
              value={content.heroSubtext}
              onChange={(e) => handleChange('heroSubtext', e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44]"
            />
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="font-heading font-bold text-sm text-[#1E2A44] pb-2 border-b border-[#E2E8F0]">
            "Why Shop With Princely's Tech" Copy
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={content.whyChooseUsTitle}
              onChange={(e) => handleChange('whyChooseUsTitle', e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44] font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
              Section Body Explanation
            </label>
            <textarea
              rows={3}
              value={content.whyChooseUsBody}
              onChange={(e) => handleChange('whyChooseUsBody', e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44]"
            />
          </div>
        </div>

        {/* About & Policies */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="font-heading font-bold text-sm text-[#1E2A44] pb-2 border-b border-[#E2E8F0]">
            About Page Story
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
              Company Story Narrative
            </label>
            <textarea
              rows={4}
              value={content.aboutText}
              onChange={(e) => handleChange('aboutText', e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44]"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#E8553A] hover:bg-[#D14529] text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Website Content'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
