import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Menu,
  X,
  Shield,
  Package,
  LogOut,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { openAuthModal } from '../../store/slices/uiSlice.js';
import { logoutUser } from '../../store/slices/authSlice.js';
import { setSearch } from '../../store/slices/productsSlice.js';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { itemCount } = useAppSelector((state) => state.cart);
  const { wishlist } = useAppSelector((state) => state.ui);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      dispatch(setSearch(searchInput.trim()));
      navigate(`/products?search=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const handleCartClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      dispatch(openAuthModal('/cart'));
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      dispatch(openAuthModal('/wishlist'));
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm transition-all">
      {/* Top Notice Bar */}
      <div className="bg-emerald-800 text-emerald-100 py-1.5 px-4 text-center text-xs tracking-wide font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-lime-400" />
        <span>100% Organic & Chemical-Free Nutrition • Flat ₹24 Express Delivery Across India • Code <strong>WELCOME10</strong> for 10% Off</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
            <div>
              <span className="text-2xl font-serif font-black tracking-wider text-emerald-950 block leading-tight">
                MITAHARA
              </span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-700 font-semibold block">
                Balanced Organic Diet
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search jowar roti, millets, organic juice, superfoods..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-emerald-100 rounded-full text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchInput && (
                <button
                  type="submit"
                  className="absolute right-2 top-1.5 p-1 bg-emerald-700 text-white rounded-full hover:bg-emerald-800 transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Nav Links Desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link to="/" className={`hover:text-emerald-700 transition ${location.pathname === '/' ? 'text-emerald-700 font-semibold' : ''}`}>
              Home
            </Link>
            <Link to="/products" className={`hover:text-emerald-700 transition ${location.pathname.startsWith('/products') ? 'text-emerald-700 font-semibold' : ''}`}>
              Products
            </Link>
            <Link to="/categories" className={`hover:text-emerald-700 transition ${location.pathname === '/categories' ? 'text-emerald-700 font-semibold' : ''}`}>
              Categories
            </Link>
            <Link to="/about-us" className={`hover:text-emerald-700 transition ${location.pathname === '/about-us' ? 'text-emerald-700 font-semibold' : ''}`}>
              About
            </Link>
            <Link to="/blogs" className={`hover:text-emerald-700 transition ${location.pathname === '/blogs' ? 'text-emerald-700 font-semibold' : ''}`}>
              Wellness Blog
            </Link>
            <Link to="/contact" className={`hover:text-emerald-700 transition ${location.pathname === '/contact' ? 'text-emerald-700 font-semibold' : ''}`}>
              Contact
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              onClick={handleWishlistClick}
              className="relative p-2.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              onClick={handleCartClick}
              className="relative p-2.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition"
              title="Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-900 rounded-full transition text-xs font-semibold"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[90px] truncate hidden sm:inline">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/user/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-600" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/user/orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
                    >
                      <Package className="w-4 h-4 text-emerald-600" />
                      <span>My Orders & Tracking</span>
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-emerald-900 bg-emerald-50/60 font-semibold hover:bg-emerald-100 transition"
                      >
                        <Shield className="w-4 h-4 text-emerald-700" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => dispatch(openAuthModal())}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-semibold shadow-sm shadow-emerald-800/20 transition"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-emerald-700 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-emerald-100 px-4 pt-3 pb-6 space-y-4 animate-fadeIn">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search jowar, millets, juice..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <Link to="/" className="py-2 border-b border-slate-50 hover:text-emerald-700">
              Home
            </Link>
            <Link to="/products" className="py-2 border-b border-slate-50 hover:text-emerald-700">
              All Products
            </Link>
            <Link to="/categories" className="py-2 border-b border-slate-50 hover:text-emerald-700">
              Categories
            </Link>
            <Link to="/about-us" className="py-2 border-b border-slate-50 hover:text-emerald-700">
              About Mitahara
            </Link>
            <Link to="/blogs" className="py-2 border-b border-slate-50 hover:text-emerald-700">
              Wellness Articles
            </Link>
            <Link to="/contact" className="py-2 hover:text-emerald-700">
              Contact & Support
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
