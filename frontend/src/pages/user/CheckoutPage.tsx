import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  MapPin,
  Lock,
  Leaf,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { placeOrder } from '../../store/slices/ordersSlice.js';
import { clearCartLocal } from '../../store/slices/cartSlice.js';
import { showToast } from '../../store/slices/uiSlice.js';

export const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { items, subtotal, deliveryCharge, gst, total, coupon } = useAppSelector((state) => state.cart);
  const { loading, error } = useAppSelector((state) => state.orders);

  // Default address fields
  const defaultSaved = user?.savedAddresses?.find((a) => a.isDefault) || user?.savedAddresses?.[0];

  const [fullName, setFullName] = useState(defaultSaved?.fullName || user?.name || '');
  const [phone, setPhone] = useState(defaultSaved?.phone || user?.phone || '');
  const [streetAddress, setStreetAddress] = useState(defaultSaved?.streetAddress || '');
  const [city, setCity] = useState(defaultSaved?.city || user?.location || '');
  const [state, setState] = useState(defaultSaved?.state || 'Telangana');
  const [postalCode, setPostalCode] = useState(defaultSaved?.postalCode || user?.pinCode || '');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleSelectSavedAddress = (addr: any) => {
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setStreetAddress(addr.streetAddress);
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone || !streetAddress || !city || !postalCode) {
      dispatch(showToast({ type: 'error', message: 'Please complete all required shipping fields.' }));
      return;
    }

    // Retrieve stored UTM campaign attribution if available
    let campaignAttribution: any = { utm_source: 'direct', utm_medium: 'none', utm_campaign: 'organic' };
    try {
      const stored = sessionStorage.getItem('mitahara_utm');
      if (stored) campaignAttribution = JSON.parse(stored);
    } catch (err) {}

    const orderPayload = {
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: 'India',
      },
      paymentMethod,
      couponCode: coupon?.couponCode || undefined,
      campaignAttribution,
    };

    const res = await dispatch(placeOrder(orderPayload));

    if (placeOrder.fulfilled.match(res)) {
      // Confetti burst
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#15803d', '#4ade80', '#f59e0b', '#84cc16'],
      });

      dispatch(clearCartLocal());
      dispatch(
        showToast({
          type: 'success',
          message: `Order #${res.payload.orderNumber} placed successfully!`,
        })
      );

      navigate(`/user/orders/${res.payload._id}/tracking`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block mb-1">
          Finalize Order
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900">
          Secure Checkout
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs sm:text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Form: Shipping Address & Payment Selection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Saved Addresses quick selection */}
          {user?.savedAddresses && user.savedAddresses.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Choose Saved Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {user.savedAddresses.map((addr: any) => (
                  <button
                    type="button"
                    key={addr._id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-left transition"
                  >
                    <p className="font-bold text-slate-900">{addr.fullName}</p>
                    <p className="text-slate-600 truncate">{addr.streetAddress}</p>
                    <p className="text-slate-500">{addr.city}, {addr.postalCode}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Form Fields */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-serif font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Delivery Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="House / Flat No., Apartment, Street"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Hyderabad"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Telangana"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">PIN Code *</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 500081"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-serif font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-700" />
              <span>Payment Option</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="w-4 h-4 text-emerald-700 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm block">Cash on Delivery (COD)</span>
                  <span className="text-[11px] text-slate-500 block">Pay cash or UPI upon delivery</span>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === 'ONLINE'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                  className="w-4 h-4 text-emerald-700 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm block">Online UPI / Cards</span>
                  <span className="text-[11px] text-slate-500 block">Demo Gateway simulator</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary: Items Snapshot & Totals */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-serif font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Review
          </h3>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-2 divide-y divide-slate-100">
            {items.map((it) => (
              <div key={it.productId} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={it.image} alt={it.name} className="w-12 h-12 object-cover rounded-xl bg-slate-100" />
                  <div>
                    <p className="font-bold text-slate-900 line-clamp-1">{it.name}</p>
                    <p className="text-slate-500">{it.quantity} × ₹{it.price}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900">₹{it.price * it.quantity}</span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-4 border-t border-slate-200 space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900">₹{subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span className="font-bold text-slate-900">₹{deliveryCharge}</span>
            </div>

            <div className="flex justify-between">
              <span>GST Tax</span>
              <span className="font-bold text-emerald-700">₹0 (Zero Charged)</span>
            </div>

            {coupon && (
              <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg">
                <span>Coupon ({coupon.couponCode})</span>
                <span>- ₹{coupon.discountAmount}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">Grand Total</span>
            <span className="text-2xl font-black text-emerald-800">₹{total}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-800/20 text-sm transition disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Place Order (₹{total})</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400">
            By placing this order, you agree to MITAHARA terms and conditions.
          </p>
        </div>
      </form>
    </div>
  );
};
