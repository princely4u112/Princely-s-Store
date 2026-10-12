import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, Layers } from 'lucide-react';
import { Category } from '../../types';
import { deleteCategory, getCategories, saveCategory, subscribeToStore } from '../../services/store';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add Modal or inline form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  const loadData = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
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

  const handleStartEdit = (cat?: Category) => {
    if (cat) {
      setEditingId(cat.id);
      setName(cat.name);
      setSlug(cat.slug);
      setDescription(cat.description || '');
      setDisplayOrder(cat.displayOrder);
    } else {
      setEditingId('new');
      setName('');
      setSlug('');
      setDescription('');
      setDisplayOrder(categories.length + 1);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await saveCategory({
      id: editingId === 'new' ? undefined : editingId || undefined,
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: description.trim(),
      displayOrder: Number(displayOrder),
    });

    setEditingId(null);
  };

  const handleDelete = async (id: string, catName: string) => {
    if (window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      await deleteCategory(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E2A44]">
            Store Categories
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Organize gadgets and phone accessories for easy customer browsing
          </p>
        </div>

        <button
          onClick={() => handleStartEdit()}
          className="px-4 py-2.5 bg-[#E8553A] hover:bg-[#D14529] text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Editing / Adding Box */}
      {editingId && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-sm animate-in fade-in">
          <h2 className="font-heading font-bold text-sm text-[#1E2A44] pb-2 border-b border-[#E2E8F0]">
            {editingId === 'new' ? 'New Category' : 'Edit Category'}
          </h2>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">Category Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (editingId === 'new' && !slug) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                  }
                }}
                placeholder="e.g. Wireless Audio"
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="wireless-audio"
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">Sort Order</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44] font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary for catalog header..."
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44]"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1E2A44] text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#1E2A44] hover:bg-[#1E2A44]/90 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Category</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-[#1E2A44] tabular-nums">
                    #{cat.displayOrder}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#1E2A44]">
                    {cat.name}
                  </td>
                  <td className="py-3 px-4 text-[#64748B] font-mono">
                    {cat.slug}
                  </td>
                  <td className="py-3 px-4 text-[#64748B] max-w-xs truncate">
                    {cat.description || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 text-[#1E2A44] hover:bg-slate-100 rounded"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
