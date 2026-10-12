import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Star, AlertCircle } from 'lucide-react';
import { Category, Product } from '../../types';
import { deleteProduct, getCategories, getProducts, saveProduct, subscribeToStore } from '../../services/store';
import { formatNaira } from '../../utils/formatters';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([getProducts(true), getCategories()]);
      setProducts(prods);
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

  const handleTogglePublish = async (product: Product) => {
    await saveProduct({
      ...product,
      isPublished: !product.isPublished,
    });
  };

  const handleToggleFeatured = async (product: Product) => {
    await saveProduct({
      ...product,
      isFeatured: !product.isFeatured,
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from store inventory?`)) {
      await deleteProduct(id);
    }
  };

  const filtered = products.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
    }
    if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E2A44]">
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Manage your store's gadgets, prices, photos, and variations
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="px-4 py-2.5 bg-[#E8553A] hover:bg-[#D14529] text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] text-[#1E2A44]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-[#64748B] whitespace-nowrap">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-[#1E2A44] focus:outline-none"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#64748B]">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-2">
            <AlertCircle className="w-8 h-8 text-[#64748B] mx-auto" />
            <p className="font-semibold text-sm text-[#1E2A44]">No products found</p>
            <p>Try clearing your filters or create a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((prod) => {
                  const img = prod.images[0]?.url;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                            {img ? (
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[9px] text-[#64748B]">No photo</span>
                            )}
                          </div>
                          <div className="truncate max-w-[220px]">
                            <p className="font-semibold text-[#1E2A44] truncate">{prod.name}</p>
                            <p className="text-[11px] text-[#64748B] font-mono">SKU: {prod.sku}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#64748B]">
                        {prod.categoryName || 'Accessories'}
                      </td>

                      <td className="py-3 px-4 font-bold text-[#1E2A44] tabular-nums">
                        {formatNaira(prod.price)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold tabular-nums ${
                            prod.stock <= 0
                              ? 'text-[#DC2626]'
                              : prod.stock <= 5
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePublish(prod)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                            prod.isPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {prod.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{prod.isPublished ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleFeatured(prod)}
                          className={`p-1 rounded transition-colors ${
                            prod.isFeatured ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'
                          }`}
                          title="Toggle Featured"
                        >
                          <Star className={`w-4 h-4 ${prod.isFeatured ? 'fill-current' : ''}`} />
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/${prod.id}/edit`}
                            className="p-1.5 text-[#1E2A44] hover:bg-slate-100 rounded transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
