import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, ArrowLeft, RefreshCw, AlertCircle, ShieldCheck, MapPin, Package } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { fetchOrderTracking, updateLiveTrackingStatus } from '../../store/slices/ordersSlice.js';
import { OrderTimeline } from '../../components/order/OrderTimeline.js';
import { getSocket, joinOrderRoom, leaveOrderRoom } from '../../services/socket.js';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { trackingData, trackingLoading, error } = useAppSelector((state) => state.orders);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderTracking(id));

      // Socket.IO real-time tracking room connection
      const socket = getSocket();
      joinOrderRoom(id);

      const handleOrderUpdate = (data: any) => {
        console.log('[Socket.IO Frontend] Received live order update:', data);
        dispatch(updateLiveTrackingStatus(data));
      };

      socket.on('order_status_updated', handleOrderUpdate);

      // Polling fallback every 12 seconds
      const interval = setInterval(() => {
        dispatch(fetchOrderTracking(id));
      }, 12000);

      return () => {
        leaveOrderRoom(id);
        socket.off('order_status_updated', handleOrderUpdate);
        clearInterval(interval);
      };
    }
  }, [id, dispatch]);

  if (trackingLoading && !trackingData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-700" />
        <p className="text-sm">Connecting to live tracking timeline...</p>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">Tracking Record Not Found</h3>
        <p className="text-xs text-slate-500 mb-6">{error || 'Could not load order tracking details.'}</p>
        <Link to="/user/orders" className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition">
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/user/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Live Internal Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
            Order #{trackingData.orderNumber}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Placed on{' '}
            {new Date(trackingData.createdAt).toLocaleDateString('en-IN', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6">
          <span className="text-xs text-slate-400 block">Grand Total</span>
          <span className="text-2xl font-black text-emerald-800 block">₹{trackingData.totalAmount}</span>
        </div>
      </div>

      {/* Timeline Component */}
      <OrderTimeline
        timeline={trackingData.timeline}
        currentStatus={trackingData.currentStatus}
        isCancelled={trackingData.isCancelled}
        courierName={trackingData.courierName}
        trackingNumber={trackingData.trackingNumber}
        estimatedDeliveryDate={trackingData.estimatedDeliveryDate}
      />

      {/* Ordered Items & Shipping Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2 text-xs">
          <h4 className="font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 mb-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Shipping Destination</span>
          </h4>
          <p className="font-bold text-slate-900">{trackingData.shippingAddress.fullName}</p>
          <p className="text-slate-600">{trackingData.shippingAddress.streetAddress}</p>
          <p className="text-slate-600">
            {trackingData.shippingAddress.city}, {trackingData.shippingAddress.state} - {trackingData.shippingAddress.postalCode}
          </p>
          <p className="text-slate-500 font-medium">Contact: {trackingData.shippingAddress.phone}</p>
        </div>

        {/* Package Contents */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 text-xs">
          <h4 className="font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 mb-2">
            <Package className="w-4 h-4 text-emerald-700" />
            <span>Items in Package ({trackingData.items.length})</span>
          </h4>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {trackingData.items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-700">
                <span className="font-medium line-clamp-1">{it.quantity} × {it.name}</span>
                <span className="font-bold text-slate-900 shrink-0">₹{it.price * it.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center gap-3 text-xs text-emerald-900">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
        <p>
          Status updates are dispatched in real-time through MITAHARA's live kitchen and logistics network.
        </p>
      </div>
    </div>
  );
};
