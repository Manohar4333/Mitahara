import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Star,
  Check,
  ShieldCheck,
  Sparkles,
  Truck,
  Leaf,
  Plus,
  Minus,
  RefreshCw,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { fetchProductById } from '../../store/slices/productsSlice.js';
import { addToCart } from '../../store/slices/cartSlice.js';
import { openAuthModal, toggleWishlist, showToast } from '../../store/slices/uiSlice.js';
import { ProductCard } from '../../components/product/ProductCard.js';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { currentProduct, relatedProducts, loading, error } = useAppSelector((state) => state.products);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { wishlist } = useAppSelector((state) => state.ui);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
      window.scrollTo(0, 0);
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentProduct?.images?.[0]) {
      setSelectedImage(currentProduct.images[0]);
    }
  }, [currentProduct]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-700" />
        <p className="text-sm">Loading product details...</p>
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition">
          Browse All Products
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(currentProduct._id);
  const isOutOfStock = !currentProduct.availability || currentProduct.stockQuantity <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      dispatch(openAuthModal(window.location.pathname));
      return;
    }
    if (isOutOfStock) return;

    const res = await dispatch(addToCart({ productId: currentProduct._id, quantity }));
    if (addToCart.fulfilled.match(res)) {
      dispatch(
        showToast({
          type: 'success',
          message: `Added ${quantity} × "${currentProduct.name}" to cart.`,
        })
      );
    }
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      dispatch(openAuthModal(window.location.pathname));
      return;
    }
    dispatch(toggleWishlist(currentProduct._id));
    dispatch(
      showToast({
        type: 'info',
        message: isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist',
      })
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentProduct.name,
        text: currentProduct.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      dispatch(showToast({ type: 'info', message: 'Product link copied to clipboard!' }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Back button */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to catalogue</span>
        </Link>
      </div>

      {/* Main Product Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md">
            <img
              src={selectedImage || currentProduct.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
              alt={currentProduct.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {currentProduct.images && currentProduct.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {currentProduct.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    selectedImage === img ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                {currentProduct.category}
              </span>

              <button
                onClick={handleShare}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
                title="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight leading-tight">
              {currentProduct.name}
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">{currentProduct.unit || 'Standard Pack'}</p>
          </div>

          {/* Ratings & Stock Status */}
          <div className="flex items-center gap-4 text-xs pb-4 border-b border-slate-200">
            <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold text-slate-900">{currentProduct.rating || '4.8'}</span>
              <span className="text-slate-500">({currentProduct.reviewsCount || 24} customer reviews)</span>
            </div>

            {isOutOfStock ? (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                Currently Out of Stock
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> In Stock ({currentProduct.stockQuantity} available)
              </span>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">₹{currentProduct.price}</span>
            {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
              <>
                <span className="text-lg text-slate-400 line-through">₹{currentProduct.originalPrice}</span>
                <span className="text-xs font-bold bg-lime-100 text-lime-800 px-2.5 py-1 rounded-full">
                  Save ₹{currentProduct.originalPrice - currentProduct.price}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
            <p>{currentProduct.description}</p>
          </div>

          {/* Key Health Benefits */}
          {currentProduct.keyHealthBenefits && currentProduct.keyHealthBenefits.length > 0 && (
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-700" />
                <span>Key Health Benefits</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-950 font-medium">
                {currentProduct.keyHealthBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Quantity</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2.5 hover:bg-slate-50 text-slate-600 disabled:opacity-30 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentProduct.stockQuantity, quantity + 1))}
                  disabled={quantity >= currentProduct.stockQuantity || isOutOfStock}
                  className="p-2.5 hover:bg-slate-50 text-slate-600 disabled:opacity-30 transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-800/20 transition disabled:opacity-50"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Shopping Cart'}</span>
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`p-3.5 rounded-2xl border transition shadow-sm ${
                  isWishlisted
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-red-500 hover:bg-red-50'
                }`}
                title="Save to Wishlist"
                aria-label="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Delivery & Purity Highlights */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Flat ₹24 Delivery Across India</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>100% Purity Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                More in {currentProduct.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
                You May Also Like
              </h2>
            </div>
            <Link
              to={`/products?category=${encodeURIComponent(currentProduct.category)}`}
              className="text-xs sm:text-sm font-bold text-emerald-700 hover:underline"
            >
              View Category
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
