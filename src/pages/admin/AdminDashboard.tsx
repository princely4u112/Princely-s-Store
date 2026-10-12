import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowRight,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { Order, Product } from '../../types';
import { getOrders, getProducts, subscribeToStore } from '../../services/store';
import { formatNaira, formatDate } from '../../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [ordList, prodList] = await Promise.all([getOrders(), getProducts(true)]);
      setOrders(ordList);
      setProducts(prodList);
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

  // Compute metrics
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'processing' || o.status === 'out_for_delivery' || o.status === 'delivered');

  const todayRevenue = paidOrders
    .filter((o) => new Date(o.createdAt).getTime() >= startOfToday)
    .reduce((sum, o) => sum + o.total, 0);

  const weekRevenue = paidOrders
    .filter((o) => new Date(o.createdAt).getTime() >= startOfWeek)
    .reduce((sum, o) => sum + o.total, 0);

  const monthRevenue = paidOrders
    .filter((o) => new Date(o.createdAt).getTime() >= startOfMonth)
    .reduce((sum, o) => sum + o.total, 0);

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending_payment');
  const lowStockProducts = products.filter((p) => p.stock <= 5);

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E2A44]">
            Store Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Real-time overview of revenue, pending dispatches, and warehouse stock
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="px-4 py-2 bg-[#E8553A] hover:bg-[#D14529] text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 bg-white border border-[#E2E8F0] hover:border-[#1E2A44] text-[#1E2A44] font-semibold text-xs rounded-lg transition-colors"
          >
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {/* Metric KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Month Revenue */}
        <div className="bg-white border border-[#E2E8F0] p-5 sm:p-6 rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-semibold uppercase tracking-wider">This Month's Sales</span>
            <TrendingUp className="w-4 h-4 text-[#16A34A]" />
          </div>
          <p className="font-extrabold text-2xl sm:text-3xl text-[#1E2A44] tabular-nums">
            {formatNaira(monthRevenue || totalRevenue)}
          </p>
          <p className="text-[11px] text-[#64748B]">
            Today: <strong className="text-[#1E2A44]">{formatNaira(todayRevenue)}</strong> · Week: {formatNaira(weekRevenue)}
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-[#E2E8F0] p-5 sm:p-6 rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#1E2A44]" />
          </div>
          <p className="font-extrabold text-2xl sm:text-3xl text-[#1E2A44] tabular-nums">
            {orders.length}
          </p>
          <p className="text-[11px] text-[#16A34A] font-medium">
            {paidOrders.length} confirmed paid & processing
          </p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-[#E2E8F0] p-5 sm:p-6 rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-semibold uppercase tracking-wider">Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-extrabold text-2xl sm:text-3xl text-amber-600 tabular-nums">
            {pendingOrders.length}
          </p>
          <p className="text-[11px] text-[#64748B]">
            Awaiting bank confirmation
          </p>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white border border-[#E2E8F0] p-5 sm:p-6 rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-semibold uppercase tracking-wider">Low Stock Warning</span>
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
          </div>
          <p className="font-extrabold text-2xl sm:text-3xl text-[#DC2626] tabular-nums">
            {lowStockProducts.length}
          </p>
          <p className="text-[11px] text-[#64748B]">
            Products at or below 5 units
          </p>
        </div>

      </div>

      {/* Two Column Layout: Recent Orders & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Recent Orders Table */}
        <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <h2 className="font-heading font-bold text-base text-[#1E2A44]">
              Recent Orders
            </h2>
            <Link to="/admin/orders" className="text-xs text-[#E8553A] font-semibold hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-[#64748B] py-8 text-center">No orders registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                  <tr>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">State</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {orders.slice(0, 6).map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-semibold text-[#1E2A44]">
                        {ord.reference}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-[#1E2A44]">{ord.customerName}</p>
                        <p className="text-[#64748B] text-[11px]">{ord.customerPhone}</p>
                      </td>
                      <td className="py-3 px-3 text-[#64748B]">{ord.deliveryState}</td>
                      <td className="py-3 px-3 font-bold text-[#1E2A44] tabular-nums">
                        {formatNaira(ord.total)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ord.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : ord.status === 'out_for_delivery'
                              ? 'bg-purple-100 text-purple-800'
                              : ord.status === 'delivered'
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Link
                          to="/admin/orders"
                          className="text-[#1E2A44] font-semibold hover:text-[#E8553A]"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Low Stock Alert List */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <h2 className="font-heading font-bold text-base text-[#1E2A44] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
              <span>Low Stock Alerts</span>
            </h2>
            <Link to="/admin/stock" className="text-xs text-[#E8553A] font-semibold hover:underline">
              Adjust
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#16A34A] space-y-1">
              <CheckCircle2 className="w-8 h-8 mx-auto" />
              <p className="font-medium">All gadget stock levels healthy!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-[#1E2A44] truncate">{p.name}</p>
                    <p className="text-[11px] text-[#64748B]">SKU: {p.sku}</p>
                  </div>
                  <span className="font-bold text-[#DC2626] tabular-nums shrink-0">
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
