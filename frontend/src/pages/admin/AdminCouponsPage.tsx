import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, RefreshCw, Ticket, Check, AlertCircle, Percent, DollarSign } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAppDispatch } from '../../store/index.js';
import { showToast } from '../../store/slices/uiSlice.js';
import { ICoupon } from '../../types/index.js';

export const AdminCouponsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<ICoupon | null>(null);
  const [formData, setFormData] = useState({
    couponCode: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed' | 'free_delivery',
    discountValue: 10,
    minOrderAmount: 200,
    maxDiscountAmount: 100,
    startDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    totalUsageLimit: 1000,
    perUserUsageLimit: 1,
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/coupons');
      setCoupons(res.data.data);
    } catch (err) {
      dispatch(showToast({ type: 'error', message: 'Failed to load coupons' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData({
      couponCode: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 200,
      maxDiscountAmount: 100,
      startDate: new Date().toISOString().slice(0, 10),
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      totalUsageLimit: 1000,
      perUserUsageLimit: 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: ICoupon) => {
    setEditingCoupon(c);
    setFormData({
      couponCode: c.couponCode,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscountAmount: c.maxDiscountAmount || 0,
      startDate: c.startDate ? new Date(c.startDate).toISOString().slice(0, 10) : '',
      expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().slice(0, 10) : '',
      totalUsageLimit: c.totalUsageLimit || 1000,
      perUserUsageLimit: c.perUserUsageLimit || 1,
      isActive: c.isActive,
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (c: ICoupon) => {
    try {
      const nextVal = !c.isActive;
      await api.patch(`/admin/coupons/${c._id}/status`, { isActive: nextVal });
      setCoupons(coupons.map((item) => (item._id === c._id ? { ...item, isActive: nextVal } : item)));
      dispatch(showToast({ type: 'success', message: `Coupon ${c.couponCode} marked as ${nextVal ? 'Active' : 'Inactive'}` }));
    } catch (err) {
      dispatch(showToast({ type: 'error', message: 'Failed to update status' }));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await api.delete(`/admin/coupons/${id}`);
        dispatch(showToast({ type: 'info', message: 'Coupon deleted.' }));
        fetchCoupons();
      } catch (err) {
        dispatch(showToast({ type: 'error', message: 'Failed to delete coupon' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        couponCode: formData.couponCode.toUpperCase().trim(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
        expiryDate: new Date(formData.expiryDate),
        totalUsageLimit: Number(formData.totalUsageLimit),
        perUserUsageLimit: Number(formData.perUserUsageLimit),
        isActive: formData.isActive,
      };

      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon._id}`, payload);
        dispatch(showToast({ type: 'success', message: 'Coupon updated successfully.' }));
      } else {
        await api.post('/admin/coupons', payload);
        dispatch(showToast({ type: 'success', message: 'New coupon created.' }));
      }

      setModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      dispatch(showToast({ type: 'error', message: err.response?.data?.message || 'Failed to save coupon' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Promotions & Campaigns
          </span>
          <h2 className="text-2xl font-serif font-black text-slate-900">
            Coupon Management ({coupons.length})
          </h2>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Min Order</th>
                <th className="py-3.5 px-4">Validity</th>
                <th className="py-3.5 px-4">Times Used</th>
                <th className="py-3.5 px-4">Discount Given</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-700" />
                    <span>Loading promotional coupons...</span>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No coupons created yet.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {c.couponCode}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{c.description}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-800">
                      {c.discountType === 'percentage'
                        ? `${c.discountValue}%`
                        : c.discountType === 'fixed'
                        ? `₹${c.discountValue}`
                        : 'Free Delivery'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">₹{c.minOrderAmount}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      Expires {new Date(c.expiryDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {c.timesUsed} / {c.totalUsageLimit}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ₹{c.totalDiscountGiven || 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                          c.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        title="Edit coupon"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-xl font-serif font-bold text-slate-900">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.couponCode}
                  onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. WELCOME10, SAVE50"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono uppercase tracking-wider"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 10% off on qualifying health orders"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="free_delivery">Free Delivery (₹24)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Max Cap Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                    placeholder="Optional maximum"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.totalUsageLimit}
                    onChange={(e) => setFormData({ ...formData, totalUsageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-700 rounded"
                  />
                  <span>Coupon is active immediately</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 text-white font-bold rounded-xl shadow"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
