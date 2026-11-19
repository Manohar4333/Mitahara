import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Layers } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { fetchCategories } from '../../store/slices/productsSlice.js';

export const CategoriesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-semibold mb-3">
          <Layers className="w-3.5 h-3.5 text-emerald-700" />
          <span>Curated Dietary Sections</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-900 tracking-tight">
          Product Categories
        </h1>
        <p className="text-xs sm:text-base text-slate-600 mt-3 leading-relaxed">
          From ancient sorghum and finger millet rotis to live enzyme cold-pressed juices, discover wholesome nourishment grouped by dietary needs.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            to={`/products?category=${encodeURIComponent(cat.name)}`}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:border-emerald-300 transition-all duration-300 flex flex-col"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
              <span className="absolute bottom-3 left-3 bg-emerald-800/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                {cat.productCount !== undefined ? `${cat.productCount} Products` : 'Available'}
              </span>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-emerald-700 transition mb-2">
                {cat.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-6">
                {cat.description}
              </p>

              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Explore Category</span>
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
