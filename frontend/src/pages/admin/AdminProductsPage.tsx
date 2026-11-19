import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Package,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAppDispatch } from '../../store/index.js';
import { showToast } from '../../store/slices/uiSlice.js';
import { IProduct } from '../../types/index.js';

export const AdminProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Rotis & Flatbreads',
    price: 150,
    originalPrice: 180,
    stockQuantity: 25,
    unit: 'Pack of 1',
    description: '',
    keyHealthBenefits: 'High Fiber, 100% Organic, Gluten-Free',
    images: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    dietaryBadges: '100% Organic, Preservative Free',
    availability: true,
  });

  const fetchProductsList = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await api.get('/admin/products', {
        params: { page: pageNum, limit: 8, search },
      });
      setProducts(res.data.data);
      setPage(res.data.pagination.page);
      setTotalPages(res.data.pagination.totalPages);
      setTotal(res.data.pagination.total);
    } catch (err: any) {
      dispatch(showToast({ type: 'error', message: 'Failed to load products list' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList(1);
  }, [search]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Rotis & Flatbreads',
      price: 150,
      originalPrice: 180,
      stockQuantity: 25,
      unit: 'Pack of 1',
      description: '',
      keyHealthBenefits: 'High Fiber, 100% Organic, Zero Preservatives',
      images: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      dietaryBadges: '100% Organic, Preservative Free',
      availability: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (prod: IProduct) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price,
      stockQuantity: prod.stockQuantity,
      unit: prod.unit || 'Pack of 1',
      description: prod.description,
      keyHealthBenefits: prod.keyHealthBenefits?.join(', ') || '',
      images: prod.images?.join(', ') || '',
      dietaryBadges: prod.dietaryBadges?.join(', ') || '',
      availability: prod.availability,
    });
    setModalOpen(true);
  };

  const handleToggleAvailability = async (prod: IProduct) => {
    try {
      const nextVal = !prod.availability;
      await api.patch(`/admin/products/${prod._id}/availability`, { availability: nextVal });
      setProducts(products.map((p) => (p._id === prod._id ? { ...p, availability: nextVal } : p)));
      dispatch(showToast({ type: 'success', message: `Product availability updated to ${nextVal ? 'Available' : 'Unavailable'}` }));
    } catch (err: any) {
      dispatch(showToast({ type: 'error', message: 'Failed to update availability' }));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/products/${id}`);
        dispatch(showToast({ type: 'info', message: 'Product deleted from catalogue.' }));
        fetchProductsList(page);
      } catch (err) {
        dispatch(showToast({ type: 'error', message: 'Failed to delete product' }));
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        stockQuantity: Number(formData.stockQuantity),
        unit: formData.unit,
        description: formData.description,
        keyHealthBenefits: formData.keyHealthBenefits.split(',').map((s) => s.trim()).filter(Boolean),
        images: formData.images.split(',').map((s) => s.trim()).filter(Boolean),
        dietaryBadges: formData.dietaryBadges.split(',').map((s) => s.trim()).filter(Boolean),
        availability: formData.availability,
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, payload);
        dispatch(showToast({ type: 'success', message: 'Product updated successfully.' }));
      } else {
        await api.post('/admin/products', payload);
        dispatch(showToast({ type: 'success', message: 'New product added to catalogue.' }));
      }

      setModalOpen(false);
      fetchProductsList(page);
    } catch (err: any) {
      dispatch(showToast({ type: 'error', message: err.response?.data?.message || 'Failed to save product' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Catalogue Management
          </span>
          <h2 className="text-2xl font-serif font-black text-slate-900">
            Products ({total})
          </h2>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, category..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-700" />
                    <span>Loading products...</span>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                          alt={prod.name}
                          className="w-10 h-10 object-cover rounded-xl bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{prod.name}</p>
                          <p className="text-[11px] text-slate-400">{prod.unit || 'Pack of 1'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{prod.category}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">₹{prod.price}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{prod.stockQuantity}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleAvailability(prod)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                          prod.availability
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {prod.availability ? 'Available' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete product"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => fetchProductsList(i + 1)}
                  className={`w-7 h-7 rounded-lg font-bold ${page === i + 1 ? 'bg-emerald-700 text-white' : 'hover:bg-slate-100'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-xl font-serif font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Organic Jowar Roti"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Rotis & Flatbreads">Rotis & Flatbreads</option>
                    <option value="Millet Breakfasts">Millet Breakfasts</option>
                    <option value="Organic Oatmeal & Bowls">Organic Oatmeal & Bowls</option>
                    <option value="Cold-Pressed Juices">Cold-Pressed Juices</option>
                    <option value="Wholesome Curries & Dal">Wholesome Curries & Dal</option>
                    <option value="Fresh Organic Salads">Fresh Organic Salads</option>
                    <option value="Millets & Ancient Grains">Millets & Ancient Grains</option>
                    <option value="Superfoods & Dry Fruits">Superfoods & Dry Fruits</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Portion / Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g. Pack of 5, 300ml Bottle, 500g Jar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive description of product ingredients and culinary qualities"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Key Health Benefits (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.keyHealthBenefits}
                  onChange={(e) => setFormData({ ...formData, keyHealthBenefits: e.target.value })}
                  placeholder="100% Gluten Free, Low Glycemic Index, High Fiber"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Image URLs (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                    className="w-4 h-4 text-emerald-700 rounded"
                  />
                  <span>Product is immediately available for purchase</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow"
                >
                  {editingProduct ? 'Save Updates' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
