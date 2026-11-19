import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Sparkles, Send, ShieldCheck, Heart, Leaf } from 'lucide-react';
import { useAppDispatch } from '../../store/index.js';
import { showToast } from '../../store/slices/uiSlice.js';

export const Footer: React.FC = () => {
  const dispatch = useAppDispatch();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.includes('@')) {
      dispatch(
        showToast({
          type: 'success',
          message: 'Thank you for subscribing to MITAHARA Organic Living Newsletter!',
        })
      );
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-emerald-950 text-emerald-100/90 pt-16 pb-12 border-t border-emerald-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                <Leaf className="w-5 h-5 text-lime-300" />
              </div>
              <div>
                <span className="text-2xl font-serif font-black tracking-wider text-white block">
                  MITAHARA
                </span>
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold block">
                  Pure • Organic • Balanced
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed max-w-sm">
              Rooted in timeless Vedic nutrition, MITAHARA champions mindful, measured living through pure stone-ground rotis, ancient millets, fresh cold-pressed juices, and unprocessed raw superfoods.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs bg-emerald-900/80 border border-emerald-800 text-emerald-300 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-lime-400" /> 100% Farm Certified
              </span>
              <span className="text-xs bg-emerald-900/80 border border-emerald-800 text-emerald-300 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Zero Chemical Preservatives
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white mb-4">
              Wholesome Menu
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-emerald-200/80">
              <li>
                <Link to="/products?category=Rotis%20%26%20Flatbreads" className="hover:text-white transition">
                  Artisan Rotis & Flatbreads
                </Link>
              </li>
              <li>
                <Link to="/products?category=Millet%20Breakfasts" className="hover:text-white transition">
                  Millet Breakfast Bowls
                </Link>
              </li>
              <li>
                <Link to="/products?category=Organic%20Oatmeal%20%26%20Bowls" className="hover:text-white transition">
                  Organic Oatmeal & Chia
                </Link>
              </li>
              <li>
                <Link to="/products?category=Cold-Pressed%20Juices" className="hover:text-white transition">
                  Cold-Pressed Detox Juices
                </Link>
              </li>
              <li>
                <Link to="/products?category=Wholesome%20Curries%20%26%20Dal" className="hover:text-white transition">
                  Slow-Cooked Curries
                </Link>
              </li>
              <li>
                <Link to="/products?category=Superfoods%20%26%20Dry%20Fruits" className="hover:text-white transition">
                  Raw Forest Honey & Seeds
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white mb-4">
              Explore Mitahara
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-emerald-200/80">
              <li>
                <Link to="/about-us" className="hover:text-white transition">
                  About Our Founder & Story
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-white transition">
                  Dietary & Nutrition Articles
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact Us & Locations
                </Link>
              </li>
              <li>
                <Link to="/user/orders" className="hover:text-white transition">
                  Track Existing Orders
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition">
                  Complete Catalogue
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white mb-4">
              Stay Nourished
            </h4>
            <p className="text-xs text-emerald-200/80 mb-3">
              Receive seasonal recipes, dietary recommendations, and member-only coupons.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-3.5 py-2.5 bg-emerald-900/60 border border-emerald-800 rounded-lg text-xs text-white placeholder-emerald-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 bg-lime-500 hover:bg-lime-600 text-emerald-950 font-bold py-2 rounded-lg text-xs transition shadow"
              >
                <span>Subscribe</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="mt-4 pt-3 border-t border-emerald-900/80 text-[11px] text-emerald-300/80 space-y-1">
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> manoharthappetla@gmail.com
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> +91 98765 43210
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-400/80 gap-4">
          <p>&copy; {new Date().getFullYear()} MITAHARA. All rights reserved. Handcrafted for pure health.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Shipping Policy (Flat ₹24 Delivery)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
