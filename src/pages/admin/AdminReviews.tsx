import React, { useEffect, useState } from 'react';
import { Star, Edit2, Trash2, Check, Plus, Eye, EyeOff, Search, MessageSquare, AlertCircle } from 'lucide-react';
import { CustomerReview } from '../../types';
import { deleteReview, getReviews, saveReview, subscribeToStore } from '../../services/store';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit / Create State
  const [editingReview, setEditingReview] = useState<Partial<CustomerReview> | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const list = await getReviews(false); // get all, including unpublished
      setReviews(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStore(loadData);
    return () => unsub();
  }, []);

  const handleStartEdit = (rev?: CustomerReview) => {
    if (rev) {
      setEditingReview({ ...rev });
    } else {
      setEditingReview({
        name: '',
        location: 'Lagos, Nigeria',
        role: 'Verified Customer',
        verifiedProduct: 'Anker PowerCore 20,000mAh PD Power Bank',
        rating: 5,
        quote: '',
        isPublished: true,
      });
    }
  };

  const handleTogglePublish = async (rev: CustomerReview) => {
    await saveReview({
      ...rev,
      isPublished: !rev.isPublished,
    });
  };

  const handleDelete = async (id: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete the review by "${customerName}"?`)) {
      await deleteReview(id);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview?.name || !editingReview?.quote || !editingReview?.verifiedProduct) return;

    setSaving(true);
    await saveReview({
      id: editingReview.id,
      name: editingReview.name.trim(),
      location: editingReview.location?.trim() || 'Nigeria',
      role: editingReview.role?.trim() || 'Verified Customer',
      verifiedProduct: editingReview.verifiedProduct.trim(),
      rating: editingReview.rating || 5,
      quote: editingReview.quote.trim(),
      isPublished: editingReview.isPublished !== undefined ? editingReview.isPublished : true,
    });
    setSaving(false);
    setEditingReview(null);
  };

  const filtered = reviews.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.verifiedProduct.toLowerCase().includes(q) ||
        r.quote.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0] dark:border-slate-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E2A44] dark:text-white">
            Customer Reviews & Social Proof
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
            Manage, edit, publish, and moderate verified buyer feedback shown on the storefront
          </p>
        </div>

        <button
          onClick={() => handleStartEdit()}
          className="px-4 py-2.5 bg-[#E8553A] hover:bg-[#D14529] text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Review</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-[#E2E8F0] dark:border-slate-800 shadow-xs max-w-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by buyer or product..."
            className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[#1E2A44] dark:text-white focus:outline-none focus:border-[#1E2A44]"
          />
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#64748B]">Loading reviews...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-2">
            <MessageSquare className="w-8 h-8 text-[#64748B] mx-auto" />
            <p className="font-semibold text-sm text-[#1E2A44] dark:text-white">No reviews found</p>
            <p>Customer reviews submitted from the storefront will appear here for management.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAFC] dark:bg-slate-800 text-[#64748B] dark:text-slate-400 uppercase tracking-wider border-b border-[#E2E8F0] dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Verified Product</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Quote Feedback</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
                {filtered.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#1E2A44] dark:text-white">{rev.name}</p>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400">{rev.location}</p>
                    </td>

                    <td className="py-3 px-4 text-[#1E2A44] dark:text-slate-200 font-medium">
                      {rev.verifiedProduct}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[#64748B] dark:text-slate-300 max-w-sm">
                      <p className="line-clamp-2 italic">"{rev.quote}"</p>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePublish(rev)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                          rev.isPublished
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {rev.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{rev.isPublished ? 'Published' : 'Hidden'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStartEdit(rev)}
                          className="p-1.5 text-[#1E2A44] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                          title="Edit review"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rev.id, rev.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-xl border border-[#E2E8F0] dark:border-slate-800">
            <h3 className="font-heading font-bold text-lg text-[#1E2A44] dark:text-white">
              {editingReview.id ? 'Edit Customer Review' : 'Add New Customer Review'}
            </h3>

            <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1E2A44] dark:text-slate-200 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={editingReview.name || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[#1E2A44] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1E2A44] dark:text-slate-200 mb-1">City / Location</label>
                  <input
                    type="text"
                    required
                    value={editingReview.location || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, location: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[#1E2A44] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1E2A44] dark:text-slate-200 mb-1">Verified Gadget / Product</label>
                <input
                  type="text"
                  required
                  value={editingReview.verifiedProduct || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, verifiedProduct: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[#1E2A44] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-semibold text-[#1E2A44] dark:text-slate-200 mb-1">Rating (1 to 5 Stars)</label>
                  <select
                    value={editingReview.rating || 5}
                    onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[#1E2A44] dark:text-white font-bold"
                  >
                    <option value={5}>5 Stars - Outstanding</option>
                    <option value={4}>4 Stars - Great</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Poor</option>
                    <option value={1}>1 Star - Bad</option>
                  </select>
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1E2A44] dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={editingReview.isPublished !== false}
                      onChange={(e) => setEditingReview({ ...editingReview, isPublished: e.target.checked })}
                      className="rounded text-[#1E2A44] focus:ring-0 w-4 h-4"
                    />
                    <span>Publish on Storefront</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1E2A44] dark:text-slate-200 mb-1">Review Quote</label>
                <textarea
                  rows={4}
                  required
                  value={editingReview.quote || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, quote: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[#1E2A44] dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#E8553A] hover:bg-[#D14529] text-white font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
