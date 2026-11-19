import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Check, Sparkles } from 'lucide-react';
import { IProduct } from '../../types/index.js';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { addToCart } from '../../store/slices/cartSlice.js';
import { openAuthModal, toggleWishlist, showToast } from '../../store/slices/uiSlice.js';

interface ProductCardProps {
  product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { wishlist } = useAppSelector((state) => state.ui);

  const isWishlisted = wishlist.includes(product._id);
  const isOutOfStock = !product.availability || product.stockQuantity <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      dispatch(openAuthModal(window.location.pathname));
      return;
    }

    if (isOutOfStock) return;

    const res = await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    if (addToCart.fulfilled.match(res)) {
      dispatch(
        showToast({
          type: 'success',
          message: `Added "${product.name}" to your cart.`,
        })
      );
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      dispatch(openAuthModal(window.location.pathname));
      return;
    }

    dispatch(toggleWishlist(product._id));
    dispatch(
      showToast({
        type: 'info',
        message: isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist',
      })
    );
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="mitahara-card group relative flex flex-col h-full bg-white overflow-hidden">
      {/* Top Image Box */}
      <Link to={`/products/${product.slug || product._id}`} className="relative block overflow-hidden bg-slate-50 aspect-[4/3]">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Dietary / Feature Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isBestSeller && (
            <span className="badge-pill bg-amber-500 text-white shadow-sm font-semibold text-[10px]">
              <Sparkles className="w-3 h-3" /> Best Seller
            </span>
          )}
          {product.dietaryBadges?.[0] && (
            <span className="badge-pill bg-emerald-800/90 text-white backdrop-blur-sm text-[10px]">
              {product.dietaryBadges[0]}
            </span>
          )}
        </div>

        {/* Discount Tag */}
        {discountPercent && (
          <span className="absolute bottom-2.5 left-2.5 bg-lime-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow">
            {discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Toggle Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-colors shadow-sm ${
            isWishlisted
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-white/80 text-slate-500 hover:text-red-500 hover:bg-white'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </Link>

      {/* Product Information Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category & Unit */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
          <span className="text-emerald-700 uppercase tracking-wider font-semibold">{product.category}</span>
          <span>{product.unit || 'Pack of 1'}</span>
        </div>

        {/* Title */}
        <Link
          to={`/products/${product.slug || product._id}`}
          className="font-semibold text-slate-900 group-hover:text-emerald-700 transition line-clamp-1 text-sm sm:text-base mb-1"
        >
          {product.name}
        </Link>

        {/* Health Benefits Snippet */}
        {product.keyHealthBenefits && product.keyHealthBenefits.length > 0 && (
          <p className="text-xs text-slate-500 line-clamp-1 mb-3">
            {product.keyHealthBenefits.slice(0, 2).join(' • ')}
          </p>
        )}

        {/* Rating & Stock */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-bold text-slate-800">{product.rating || '4.8'}</span>
            <span className="text-slate-400">({product.reviewsCount || 24})</span>
          </div>
          {isOutOfStock ? (
            <span className="text-red-600 font-semibold text-[11px]">Out of Stock</span>
          ) : product.stockQuantity < 5 ? (
            <span className="text-amber-600 font-semibold text-[11px]">Only {product.stockQuantity} left</span>
          ) : (
            <span className="text-emerald-700 flex items-center gap-0.5 text-[11px] font-medium">
              <Check className="w-3 h-3" /> In Stock
            </span>
          )}
        </div>

        {/* Price & Add to Cart button */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">₹{product.originalPrice}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-800/10'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
