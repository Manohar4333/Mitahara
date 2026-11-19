import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Truck, ArrowRight, RefreshCw, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { fetchMyOrders } from '../../store/slices/ordersSlice.js';

export const MyOrdersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { orders, loading, error } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'OUT FOR DELIVERY':
      case 'SHIPPED':
        return 'bg-lime-100 text-lime-900 border-lime-300';
      default:
        return 'bg-amber-100 text-amber-900 border-amber-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block mb-1">
          Purchase History
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900">
          My Orders
        </h1>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-700" />
          <p className="text-sm">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-200 text-center p-8 max-w-md mx-auto shadow-sm">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 mb-6">You haven't placed any healthy orders yet.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden hover:border-emerald-200 transition"
            >
              {/* Order Header */}
              <div className="bg-slate-50/70 p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Order Number</span>
                  <span className="font-mono font-bold text-slate-900 sm:text-sm">{order.orderNumber}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Date Placed</span>
                  <span className="font-medium text-slate-800">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Total Amount</span>
                  <span className="font-bold text-emerald-800 sm:text-sm">₹{order.totalAmount}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Current Status</span>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-xl bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-slate-500">Qty: {item.quantity} • ₹{item.price} each</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Tracking Action Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    Payment: <strong className="text-slate-800">{order.paymentMethod}</strong> ({order.paymentStatus})
                  </div>

                  <Link
                    to={`/user/orders/${order._id}/tracking`}
                    className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Track Order</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
