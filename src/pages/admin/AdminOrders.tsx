import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  MessageCircle,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  X,
  FileText,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { getOrders, updateOrderStatus, subscribeToStore } from '../../services/store';
import { formatDate, formatNaira } from '../../utils/formatters';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadData = async () => {
    try {
      const ords = await getOrders();
      setOrders(ords);
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

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setInternalNotes(order.internalNotes || '');
  };

  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    const updated = await updateOrderStatus(selectedOrder.id, status, internalNotes);
    if (updated) {
      setSelectedOrder(updated);
    }
    setUpdatingStatus(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    await updateOrderStatus(selectedOrder.id, selectedOrder.status, internalNotes);
    alert('Internal notes saved successfully.');
  };

  const filtered = orders.filter((o) => {
    if (search) {
      const q = search.toLowerCase();
      const matchRef = o.reference.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
      if (!matchRef && !matchName && !matchPhone) return false;
    }
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });

  const getWhatsAppCustomerUrl = (order: Order) => {
    const text = `Hello ${order.customerName}, this is Princely's Tech regarding your order ${order.reference}. We are contacting you to confirm your delivery details.`;
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const intPhone = cleanPhone.startsWith('0') ? '234' + cleanPhone.slice(1) : cleanPhone;
    return `https://wa.me/${intPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E2A44]">
            Customer Orders
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Monitor verified payments, manage dispatch status, and communicate with customers
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, name, phone..."
            className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] text-[#1E2A44]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#64748B]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-[#1E2A44] focus:outline-none"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="paid">Paid & Confirmed</option>
            <option value="processing">Processing</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#64748B]">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B]">No orders matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">State & City</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#1E2A44]">
                      {ord.reference}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#1E2A44]">{ord.customerName}</p>
                      <p className="text-[#64748B] text-[11px] tabular-nums">{ord.customerPhone}</p>
                    </td>

                    <td className="py-3 px-4 text-[#64748B]">
                      {ord.deliveryCity}, {ord.deliveryState}
                    </td>

                    <td className="py-3 px-4 font-bold text-[#1E2A44] tabular-nums">
                      {formatNaira(ord.total)}
                    </td>

                    <td className="py-3 px-4 text-[#64748B]">
                      {formatDate(ord.createdAt)}
                    </td>

                    <td className="py-3 px-4">
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

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={getWhatsAppCustomerUrl(ord)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Message customer on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 fill-current" />
                        </a>
                        <button
                          onClick={() => handleOpenDetail(ord)}
                          className="px-2.5 py-1 bg-[#1E2A44] hover:bg-[#1E2A44]/90 text-white font-semibold rounded text-[11px] flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-[#64748B] hover:text-[#1E2A44] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="pb-4 border-b border-[#E2E8F0]">
              <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-semibold">Order Detail</span>
              <h2 className="font-heading font-extrabold text-xl text-[#1E2A44] font-mono">
                {selectedOrder.reference}
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">Placed on {formatDate(selectedOrder.createdAt)}</p>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
              <div>
                <p className="font-semibold text-[#1E2A44] uppercase tracking-wider mb-1">Customer Info</p>
                <p className="font-medium text-[#1E2A44]">{selectedOrder.customerName}</p>
                <p className="text-[#64748B]">{selectedOrder.customerEmail}</p>
                <p className="text-[#64748B] tabular-nums font-semibold mt-1">{selectedOrder.customerPhone}</p>
              </div>

              <div>
                <p className="font-semibold text-[#1E2A44] uppercase tracking-wider mb-1">Delivery Destination</p>
                <p className="text-[#1E2A44]">{selectedOrder.deliveryAddress}</p>
                <p className="text-[#64748B]">{selectedOrder.deliveryCity}, {selectedOrder.deliveryState} State</p>
                {selectedOrder.orderNotes && (
                  <p className="mt-1 text-amber-800 italic">Note: "{selectedOrder.orderNotes}"</p>
                )}
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2 text-xs">
              <p className="font-semibold text-[#1E2A44] uppercase tracking-wider">Ordered Items</p>
              <div className="border border-[#E2E8F0] rounded-lg divide-y divide-[#E2E8F0]">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1E2A44]">{it.productName}</p>
                      {it.variantName && <p className="text-[#64748B]">{it.variantName}</p>}
                      <p className="text-[#64748B]">{it.quantity} x {formatNaira(it.unitPrice)}</p>
                    </div>
                    <span className="font-bold text-[#1E2A44] tabular-nums">{formatNaira(it.totalPrice)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-between font-bold text-sm text-[#1E2A44]">
                <span>Total Amount:</span>
                <span className="tabular-nums">{formatNaira(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Status Updater */}
            <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
              <label className="block text-xs font-semibold text-[#1E2A44]">
                Update Fulfillment Status:
              </label>
              <div className="flex flex-wrap gap-2">
                {(['paid', 'processing', 'out_for_delivery', 'delivered', 'cancelled'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateStatus(st)}
                    disabled={updatingStatus}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                      selectedOrder.status === st
                        ? 'bg-[#1E2A44] text-white shadow-xs'
                        : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#1E2A44]'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
              <label className="block text-xs font-semibold text-[#1E2A44]">
                Internal Warehouse / Courier Notes
              </label>
              <textarea
                rows={2}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="e.g. Courier tracking code: GIG-882194, Driver phone..."
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44]"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[#1E2A44] font-semibold text-xs rounded"
              >
                Save Notes
              </button>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
              <a
                href={getWhatsAppCustomerUrl(selectedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold text-xs rounded-lg flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Message Customer on WhatsApp</span>
              </a>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1E2A44] font-semibold text-xs rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Order Slip</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
