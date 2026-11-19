import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { toggleWishlist, showToast } from '../../store/slices/uiSlice.js';
import { addToCart } from '../../store/slices/cartSlice.js';
import { api } from '../../services/api.js';
import { IProduct } from '../../types/index.js';

export const WishlistPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { wishlist } = useAppSelector((state) => state.ui);
  const [wishlistProducts, setWishlistProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (wishlist.length === 0) {
        setWishlistProducts([]);
        return;
      }
      setLoading(true);
      try {
        const promises = wishlist.map((id) => api.get(`/products/${id}`).then((r) => r.data.data).catch(() => null));
        const results = await Promise.all(promises);
        setWishlistProducts(results.filter(Boolean));
      } catch (err) {
        console.error('Failed to load wishlist products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistItems();
  }, [wishlist]);

  const handleMoveToCart = async (prod: IProduct) => {
    const res = await dispatch(addToCart({ productId: prod._id, quantity: 1 }));
    if (addToCart.fulfilled.match(res)) {
      dispatch(toggleWishlist(prod._id));
      dispatch(showToast({ type: 'success', message: `Moved "${prod.name}" to cart.` }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block mb-1">
          Saved Wholesome Foods
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900">
          My Wishlist ({wishlist.length})
        </h1>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-700" />
          <p className="text-sm">Loading your saved items...</p>
        </div>
      ) : wishlistProducts.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-200 text-center p-8 max-w-md mx-auto shadow-sm">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-500 mb-6">
            Tap the heart icon on any product to save it here for later.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <div key={product._id} className="mitahara-card group flex flex-col bg-white overflow-hidden">
              <Link to={`/products/${product.slug || product._id}`} className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </Link>

              <div className="p-4 flex flex-col flex-1">
                <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-1">{product.category}</span>
                <Link to={`/products/${product.slug || product._id}`} className="font-bold text-slate-900 hover:text-emerald-700 transition line-clamp-1 text-sm mb-2">
                  {product.name}
                </Link>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-base font-bold text-slate-900">₹{product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-slate-400 line-through">₹{product.originalPrice}</span>
                  )}
                </div>

                <div className="mt-auto flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>
                  <button
                    onClick={() => dispatch(toggleWishlist(product._id))}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
