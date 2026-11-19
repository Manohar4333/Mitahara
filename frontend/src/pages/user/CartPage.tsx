import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import {
  updateCartItemQty,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  clearCouponError,
} from '../../store/slices/cartSlice.js';
import { showToast } from '../../store/slices/uiSlice.js';

export const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items, itemCount, subtotal, deliveryCharge, gst, total, coupon, couponError, loading } =
    useAppSelector((state) => state.cart);

  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setApplyingCoupon(true);
    const res = await dispatch(applyCoupon({ couponCode: couponInput.trim(), subtotal }));
    setApplyingCoupon(false);

    if (applyCoupon.fulfilled.match(res)) {
      dispatch(showToast({ type: 'success', message: `Coupon "${res.payload.couponCode}" applied!` }));
      setCouponInput('');
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    dispatch(showToast({ type: 'info', message: 'Coupon removed' }));
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-black text-slate-900 mb-2">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Explore our pure, organic grains, cold-pressed juices, and healthy snacks to start nourishing yourself.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block mb-1">
          Review Your Selection
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900">
          Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.productId} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link to={`/products/${item.slug || item.productId}`} className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </Link>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-0.5">{item.category}</span>
                  <Link to={`/products/${item.slug || item.productId}`} className="font-bold text-slate-900 hover:text-emerald-700 transition text-sm sm:text-base">
                    {item.name}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">{item.unit || 'Standard Pack'}</p>
                  <p className="text-xs font-bold text-slate-900 mt-1">₹{item.price} each</p>
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    onClick={() => dispatch(updateCartItemQty({ productId: item.productId, quantity: item.quantity - 1 }))}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(updateCartItemQty({ productId: item.productId, quantity: item.quantity + 1 }))}
                    disabled={item.quantity >= item.stockQuantity}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 disabled:opacity-30 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <span className="text-base font-bold text-slate-900">₹{item.price * item.quantity}</span>
                </div>

                <button
                  onClick={() => dispatch(removeCartItem(item.productId))}
                  className="p-2 text-slate-400 hover:text-red-500 transition"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-emerald-700" />
              <span>Apply Coupon</span>
            </h3>

            {coupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-emerald-900 font-mono tracking-wider">{coupon.couponCode}</span>
                  <p className="text-[11px] text-emerald-700">₹{coupon.discountAmount} discount applied</p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="p-1 text-slate-400 hover:text-red-500 rounded-full"
                  title="Remove Coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      if (couponError) dispatch(clearCouponError());
                    }}
                    placeholder="e.g. WELCOME10"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>

                {couponError && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponError}</span>
                  </p>
                )}

                <p className="text-[10px] text-slate-400">
                  Try <strong>WELCOME10</strong> (10% off) or <strong>SAVE50</strong> (₹50 off on ₹250+).
                </p>
              </form>
            )}
          </div>

          {/* Pricing Calculation Summary */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-serif font-bold text-slate-900 pb-3 border-b border-slate-100">
              Checkout Calculation
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Cart Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Delivery Charge</span>
                </span>
                <span className="font-bold text-slate-900">₹{deliveryCharge}</span>
              </div>

              <div className="flex justify-between">
                <span>GST (Goods & Services Tax)</span>
                <span className="font-bold text-emerald-700">₹0 (Zero Charged)</span>
              </div>

              {coupon && (
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg">
                  <span>Coupon Discount ({coupon.couponCode})</span>
                  <span>- ₹{coupon.discountAmount}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Final Total</span>
              <span className="text-2xl font-black text-emerald-800">₹{total}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-800/20 text-sm transition"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & Secure Checkout • Backend Price Validated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
