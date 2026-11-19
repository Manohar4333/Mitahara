import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Truck,
  Search,
  CheckCircle2,
  Calendar,
  Save,
  Clock,
  RefreshCw,
  Package,
  MapPin,
  Send,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAppDispatch } from '../../store/index.js';
import { showToast } from '../../store/slices/uiSlice.js';
import { IOrder, OrderStatus } from '../../types/index.js';

export const AdminOrderTrackingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  // Form Fields for Updating Tracking
  const [status, setStatus] = useState<OrderStatus>('PROCESSING');
  const [message, setMessage] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders', { params: { limit: 50, search } });
      setOrders(res.data.data);

      const urlOrderId = searchParams.get('orderId');
      if (urlOrderId) {
        const found = res.data.data.find((o: IOrder) => o._id === urlOrderId);
        if (found) selectOrder(found);
      } else if (res.data.data.length > 0 && !selectedOrder) {
        selectOrder(res.data.data[0]);
      }
    } catch (err) {
      dispatch(showToast({ type: 'error', message: 'Failed to load tracking queue' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

  const selectOrder = (ord: IOrder) => {
    setSelectedOrder(ord);
    setStatus(ord.orderStatus);
    setMessage('');
    setCourierName(ord.courierName || 'Mitahara Green Express');
    setTrackingNumber(ord.trackingNumber || '');
    setEstimatedDeliveryDate(
      ord.estimatedDeliveryDate ? new Date(ord.estimatedDeliveryDate).toISOString().slice(0, 10) : ''
    );
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSaving(true);
    try {
      const payload = {
        status,
        message: message.trim() || `Status updated to ${status}.`,
        courierName: courierName.trim(),
        trackingNumber: trackingNumber.trim(),
        estimatedDeliveryDate: estimatedDeliveryDate || undefined,
      };

      const res = await api.patch(`/admin/orders/${selectedOrder._id}/status`, payload);
      const updated = res.data.data as IOrder;

      setSelectedOrder(updated);
      setOrders(orders.map((o) => (o._id === updated._id ? updated : o)));

      dispatch(
        showToast({
          type: 'success',
          message: `Order #${updated.orderNumber} status updated to ${updated.orderStatus} & customer notified via email & Socket.IO!`,
        })
      );
      setMessage('');
    } catch (err: any) {
      dispatch(
        showToast({
          type: 'error',
          message: err.response?.data?.message || 'Failed to update order status',
        })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
          Real-time Fulfillment Control
        </span>
        <h2 className="text-2xl font-serif font-black text-slate-900">
          Order Tracking & Dispatch Console
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Update timeline stages. Real-time Socket.IO broadcasts and email status alerts are dispatched automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Orders Queue */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, recipient..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-700" />
                <span className="text-xs">Loading queue...</span>
              </div>
            ) : orders.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No orders found.</p>
            ) : (
              orders.map((ord) => (
                <button
                  key={ord._id}
                  onClick={() => selectOrder(ord)}
                  className={`w-full p-4 rounded-2xl border text-left transition ${
                    selectedOrder?._id === ord._id
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-slate-900 text-xs">{ord.orderNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-800">
                      {ord.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold">{ord.customerName}</p>
                  <p className="text-[11px] text-slate-500">₹{ord.totalAmount} • {ord.items.length} items</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Update Tracking Form & History */}
        <div className="lg:col-span-7 space-y-6">
          {selectedOrder ? (
            <>
              {/* Order Status Update Form */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-slate-900">
                      Update Order #{selectedOrder.orderNumber}
                    </h3>
                    <p className="text-xs text-slate-500">{selectedOrder.customerName} ({selectedOrder.customerEmail})</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                    Current: {selectedOrder.orderStatus}
                  </span>
                </div>

                <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      New Order Milestone *
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as OrderStatus)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      <option value="ORDER PLACED">ORDER PLACED</option>
                      <option value="ORDER CONFIRMED">ORDER CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING (Kitchen Batch Preparation)</option>
                      <option value="SHIPPED">SHIPPED (Handed to Courier Partner)</option>
                      <option value="OUT FOR DELIVERY">OUT FOR DELIVERY (Last Mile Transit)</option>
                      <option value="DELIVERED">DELIVERED (Successfully Handed Over)</option>
                      <option value="CANCELLED">CANCELLED (Terminal State)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Status Update Note / Message
                    </label>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g. Dispatched via temperature-controlled express van"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">
                        Courier Partner Name
                      </label>
                      <input
                        type="text"
                        value={courierName}
                        onChange={(e) => setCourierName(e.target.value)}
                        placeholder="e.g. Mitahara Green Express"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">
                        Courier Tracking Number
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="e.g. MGX-982143"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Estimated Delivery Date
                    </label>
                    <input
                      type="date"
                      value={estimatedDeliveryDate}
                      onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      {saving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Push Real-time Status Update & Email</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Status History Log */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-serif font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>Recorded Milestones ({selectedOrder.statusHistory?.length || 0})</span>
                </h3>

                <div className="space-y-3">
                  {selectedOrder.statusHistory?.map((h, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-2xl flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{h.status}</span>
                          <span className="text-[10px] text-slate-400 font-mono">by {h.updatedBy}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{h.message}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(h.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
              Select an order from the queue to modify tracking status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
