import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout.js';
import { AdminLayout } from '../layouts/AdminLayout.js';

// User Pages
import { HomePage } from '../pages/user/HomePage.js';
import { ProductsPage } from '../pages/user/ProductsPage.js';
import { ProductDetailPage } from '../pages/user/ProductDetailPage.js';
import { CategoriesPage } from '../pages/user/CategoriesPage.js';
import { LoginPage } from '../pages/user/LoginPage.js';
import { CartPage } from '../pages/user/CartPage.js';
import { CheckoutPage } from '../pages/user/CheckoutPage.js';
import { MyOrdersPage } from '../pages/user/MyOrdersPage.js';
import { OrderTrackingPage } from '../pages/user/OrderTrackingPage.js';
import { WishlistPage } from '../pages/user/WishlistPage.js';
import { ProfilePage } from '../pages/user/ProfilePage.js';
import { AboutPage } from '../pages/user/AboutPage.js';
import { ContactPage } from '../pages/user/ContactPage.js';
import { BlogsPage } from '../pages/user/BlogsPage.js';

// Admin Pages
import { AdminOverviewPage } from '../pages/admin/AdminOverviewPage.js';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage.js';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage.js';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage.js';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage.js';
import { AdminOrderTrackingPage } from '../pages/admin/AdminOrderTrackingPage.js';
import { AdminCouponsPage } from '../pages/admin/AdminCouponsPage.js';
import { AdminMarketingAnalyticsPage } from '../pages/admin/AdminMarketingAnalyticsPage.js';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage.js';

import { useAppSelector } from '../store/index.js';

// Auth Protection wrapper
const ProtectedUserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Storefront Layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="about-us" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="blogs" element={<BlogsPage />} />

        {/* Protected User Routes */}
        <Route
          path="cart"
          element={
            <ProtectedUserRoute>
              <CartPage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedUserRoute>
              <CheckoutPage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="user/profile"
          element={
            <ProtectedUserRoute>
              <ProfilePage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="user/orders"
          element={
            <ProtectedUserRoute>
              <MyOrdersPage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="user/orders/:id/tracking"
          element={
            <ProtectedUserRoute>
              <OrderTrackingPage />
            </ProtectedUserRoute>
          }
        />

        {/* Alias routes from reference site */}
        <Route path="rotis" element={<Navigate to="/products?category=Rotis%20%26%20Flatbreads" replace />} />
        <Route path="millet-breakfast" element={<Navigate to="/products?category=Millet%20Breakfasts" replace />} />
        <Route path="oat-meal" element={<Navigate to="/products?category=Organic%20Oatmeal%20%26%20Bowls" replace />} />
        <Route path="juices" element={<Navigate to="/products?category=Cold-Pressed%20Juices" replace />} />
        <Route path="curries" element={<Navigate to="/products?category=Wholesome%20Curries%20%26%20Dal" replace />} />
        <Route path="salads" element={<Navigate to="/products?category=Fresh%20Organic%20Salads" replace />} />
        <Route path="millets" element={<Navigate to="/products?category=Millets%20%26%20Ancient%20Grains" replace />} />
      </Route>

      {/* Admin Layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverviewPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="order-tracking" element={<AdminOrderTrackingPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="marketing-analytics" element={<AdminMarketingAnalyticsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
