import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Heart,
  Truck,
  Leaf,
  Clock,
  CheckCircle2,
  Quote,
  Star,
  Award,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { fetchProducts, fetchFeaturedProducts, fetchCategories } from '../../store/slices/productsSlice.js';
import { ProductCard } from '../../components/product/ProductCard.js';

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, featuredProducts, categories, loading } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 12 }));
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-green-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#86efac_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/30 text-lime-300 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ancient Vedic Wisdom • Modern Wholesome Living</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-tight">
              Eat Balanced. <br />
              <span className="text-lime-300 underline decoration-lime-400/40 decoration-wavy underline-offset-8">
                Live Mindfully.
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-emerald-100/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              In Ayurveda, <em>Mitahara</em> represents the divine golden rule of eating wholesome, nutritious portions. Discover handcrafted stone-ground rotis, cold-pressed detox juices, and ancient millets direct from organic farmers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-lime-400 hover:bg-lime-500 text-emerald-950 font-bold rounded-xl text-sm shadow-lg shadow-lime-500/20 transition transform hover:-translate-y-0.5"
              >
                <span>Shop Fresh Nutrition</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/categories"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm border border-white/20 transition backdrop-blur-sm"
              >
                <span>Browse Categories</span>
              </Link>
            </div>

            {/* Quick Benefits Ticker */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-700/60 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <p className="text-xl sm:text-2xl font-bold font-serif text-lime-300">100%</p>
                <p className="text-[11px] text-emerald-200">Chemical-Free</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-serif text-lime-300">₹24</p>
                <p className="text-[11px] text-emerald-200">Express Delivery</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-serif text-lime-300">Zero</p>
                <p className="text-[11px] text-emerald-200">Refined Flours</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 group">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                alt="Mitahara Wholesome Nutrition Bowl"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent"></div>

              {/* Floating Product Highlight Tag */}
              <div className="absolute bottom-5 left-5 right-5 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Fresh Morning Bowl
                  </span>
                  <span className="font-bold text-slate-900 text-sm block">Foxtail Millet Upma Meal</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 line-through block">₹190</span>
                  <span className="text-base font-extrabold text-emerald-800 block">₹160</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block mb-1">
            Organic & Wholesome Selection
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-slate-900">
            Explore Product Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Every product is handpicked, nutritionist-formulated, and crafted without preservatives.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition text-sm sm:text-base mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-auto flex items-center justify-between text-xs text-emerald-700 font-semibold">
                  <span>{cat.productCount ? `${cat.productCount} items` : 'Explore items'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS (Session-stable Random Available Products) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Curated Daily Picks</span>
            </div>
            <h2 className="text-3xl font-serif font-black text-slate-900">Featured Nutrition</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Specially selected organic foods that nourish your body throughout the day.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4)).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* WHY CHOOSE MITAHARA SECTION */}
      <section className="bg-gradient-to-b from-emerald-50/60 to-white py-16 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block mb-1">
              Our Purity Promise
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-slate-900">
              Why Choose Mitahara?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              We eliminate ultra-processed grains, artificial enhancers, and harmful preservatives so your food remains medicine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">100% Organic & Native</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Directly sourced from indigenous small-scale organic farmers practicing non-GMO, chemical-free agriculture.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Preservative Free</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero synthetic colors, zero emulsifiers, and zero chemical preservatives. Cooked and pressed with authentic purity.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-lime-100 text-lime-800 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-lime-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Doctor & Nutritionist Vetted</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recipes designed in consultation with clinical dieticians for balanced glycemic index and gut microbiome health.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-teal-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">₹24 Express Delivery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consistent low-cost shipping across India with temperature-controlled packaging ensuring fresh arrival.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BEST SELLERS & NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-1">
                  Customer Favorites
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
                  Best Sellers
                </h2>
              </div>
              <Link to="/products?sort=popular" className="text-xs sm:text-sm font-bold text-emerald-700 hover:underline">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-lime-600 block mb-1">
                  Fresh From Our Kitchens
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
                  New Arrivals
                </h2>
              </div>
              <Link to="/products?sort=newest" className="text-xs sm:text-sm font-bold text-emerald-700 hover:underline">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* CUSTOMER TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block mb-1">
            Community Love
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-slate-900">
            Real Stories From Real Lives
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            See how mindful nutrition with MITAHARA has revitalized energy, gut health, and daily wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-4">
                "The Jowar Bhakri and Ragi rotis are extraordinary. Light on the stomach, perfectly textured, and completely clean. My post-lunch lethargy has completely vanished."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                PS
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Pooja Sharma</h4>
                <p className="text-[11px] text-slate-500">Bangalore • Verified Buyer</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-4">
                "The Royal ABC Juice and Green Detox are pressed fresh without any added sugars. You can taste the genuine farm freshness. Plus the ₹24 delivery is unbeatable!"
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                VR
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Vikram Reddy</h4>
                <p className="text-[11px] text-slate-500">Hyderabad • Verified Buyer</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-4">
                "Finding pure wild forest honey that isn't adulterated with sugar syrup is rare. The Kashmiri honey and seed mix are staples in my pantry now."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                AK
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Ananya Kulkarni</h4>
                <p className="text-[11px] text-slate-500">Pune • Verified Buyer</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
