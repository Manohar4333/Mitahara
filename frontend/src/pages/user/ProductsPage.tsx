import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, Check, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import {
  fetchProducts,
  fetchCategories,
  setCategoryFilter,
  setSortFilter,
  setAvailableOnly,
  setSearch,
  resetFilters,
} from '../../store/slices/productsSlice.js';
import { ProductCard } from '../../components/product/ProductCard.js';

export const ProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { products, categories, total, totalPages, page, loading, filters } = useAppSelector(
    (state) => state.products
  );

  // Sync URL search params with Redux filters on mount
  useEffect(() => {
    dispatch(fetchCategories());

    const urlCategory = searchParams.get('category');
    const urlSearch = searchParams.get('search');
    const urlSort = searchParams.get('sort');

    if (urlCategory) dispatch(setCategoryFilter(urlCategory));
    if (urlSearch) dispatch(setSearch(urlSearch));
    if (urlSort) dispatch(setSortFilter(urlSort));

    dispatch(fetchProducts());
  }, [dispatch]);

  // When filters change, refetch
  const handleCategoryChange = (catName: string) => {
    dispatch(setCategoryFilter(catName));
    setSearchParams((prev) => {
      if (catName === 'all') prev.delete('category');
      else prev.set('category', catName);
      return prev;
    });
    dispatch(fetchProducts({ page: 1, category: catName }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    dispatch(setSortFilter(val));
    setSearchParams((prev) => {
      prev.set('sort', val);
      return prev;
    });
    dispatch(fetchProducts({ page: 1, sort: val }));
  };

  const handleAvailableToggle = () => {
    const nextVal = !filters.availableOnly;
    dispatch(setAvailableOnly(nextVal));
    dispatch(fetchProducts({ page: 1, availableOnly: nextVal }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchProducts({ page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(fetchProducts({ page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block mb-1">
            MITAHARA Store
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900">
            Organic Healthy Foods
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {products.length} of {total} nutrition-packed items
          </p>
        </div>

        {/* Search input & Sort dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              placeholder="Search products..."
              className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filters.sort}
              onChange={handleSortChange}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Best Selling</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills & Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition shrink-0 ${
              filters.category === 'all'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryChange(cat.name)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition shrink-0 ${
                filters.category.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Availability Toggle */}
        <button
          onClick={handleAvailableToggle}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition shrink-0 ${
            filters.availableOnly
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
              filters.availableOnly ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300'
            }`}
          >
            {filters.availableOnly && <Check className="w-3 h-3" />}
          </div>
          <span>In Stock Only</span>
        </button>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-700" />
          <p className="text-sm">Fetching organic products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 bg-white rounded-2xl border border-slate-200 text-center p-8 max-w-lg mx-auto">
          <p className="text-base font-bold text-slate-800 mb-2">No matching products found</p>
          <p className="text-xs text-slate-500 mb-6">
            We couldn't find any items matching your active search or filters.
          </p>
          <button
            onClick={() => {
              dispatch(resetFilters());
              dispatch(fetchProducts());
            }}
            className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-8 flex items-center justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => {
            const pageNumber = i + 1;
            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                  page === pageNumber
                    ? 'bg-emerald-800 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
