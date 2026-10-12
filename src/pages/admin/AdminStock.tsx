import React, { useEffect, useState } from 'react';
import { Search, AlertTriangle, Check, Warehouse } from 'lucide-react';
import { Product } from '../../types';
import { getProducts, updateProductStock, subscribeToStore } from '../../services/store';

export const AdminStock: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const prods = await getProducts(true);
      setProducts(prods);
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

  const handleAdjust = async (id: string, delta: number) => {
    const p = products.find((prod) => prod.id === id);
    if (!p) return;
    const next = Math.max(0, p.stock + delta);
    await updateProductStock(id, next);
  };

  const handleSetDirect = async (id: string, val: number) => {
    await updateProductStock(id, Math.max(0, val));
  };

  const filtered = products.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E2A44]">
            Stock Inventory Management
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Real-time warehouse inventory counts and replenishment controls
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#E2E8F0] shadow-xs text-xs">
          <label className="text-[#64748B] font-medium">Low Stock Threshold:</label>
          <input
            type="number"
            min={1}
            max={50}
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            className="w-14 px-2 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded font-mono text-center font-bold text-[#1E2A44]"
          />
          <span className="text-[#64748B]">units</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs max-w-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name or SKU..."
            className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] text-[#1E2A44]"
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.map((prod) => {
                const isLow = prod.stock <= lowStockThreshold;
                return (
                  <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#1E2A44]">{prod.name}</p>
                      <p className="text-[11px] text-[#64748B] font-mono">SKU: {prod.sku}</p>
                    </td>

                    <td className="py-3 px-4 text-[#64748B]">
                      {prod.categoryName}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-base tabular-nums">
                      <input
                        type="number"
                        min={0}
                        value={prod.stock}
                        onChange={(e) => handleSetDirect(prod.id, Number(e.target.value))}
                        className={`w-20 px-2 py-1 border rounded text-sm font-bold text-center ${
                          isLow
                            ? 'border-[#DC2626] bg-red-50 text-[#DC2626]'
                            : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#1E2A44]'
                        }`}
                      />
                    </td>

                    <td className="py-3 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-[#DC2626] font-semibold text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Restock Needed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#16A34A] font-semibold text-[11px]">
                          <Check className="w-3.5 h-3.5" />
                          <span>Adequate</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAdjust(prod.id, -1)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#1E2A44] font-bold rounded"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleAdjust(prod.id, 5)}
                          className="px-2.5 py-1 bg-[#1E2A44] hover:bg-[#1E2A44]/90 text-white font-bold rounded"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleAdjust(prod.id, 20)}
                          className="px-2.5 py-1 bg-[#E8553A] hover:bg-[#D14529] text-white font-bold rounded"
                        >
                          +20
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
