import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Clock,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../../services/api.js';

export const AdminOverviewPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const [analyticsRes, ordersRes, productsRes] = await Promise.all([
          api.get('/admin/analytics/overview?range=30d'),
          api.get('/admin/orders?limit=5'),
          api.get('/admin/products?limit=5'),
        ]);

        setData({
          analytics: analyticsRes.data.data,
          recentOrders: ordersRes.data.data,
          products: productsRes.data.data,
        });
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-700" />
        <p className="text-sm">Aggregating real-time store metrics...</p>
      </div>
    );
  }

  const kpis = data?.analytics?.kpis || {};
  const timeSeries = data?.analytics?.revenueTimeSeries || [];

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Executive Summary
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
            Store Performance Overview
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/marketing-analytics"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow transition"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Full Marketing Analytics</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase block">Total Revenue</span>
            <span className="text-2xl font-black text-slate-900 block mt-1">₹{kpis.totalRevenue?.toLocaleString('en-IN') || 0}</span>
            <span className="text-[11px] text-emerald-600 font-bold block mt-1">Real database records</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase block">Total Orders</span>
            <span className="text-2xl font-black text-slate-900 block mt-1">{kpis.totalOrders || 0}</span>
            <span className="text-[11px] text-slate-400 block mt-1">{kpis.validOrdersCount || 0} active orders</span>
          </div>
          <div className="w-12 h-12 bg-lime-50 text-lime-700 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase block">Registered Users</span>
            <span className="text-2xl font-black text-slate-900 block mt-1">{kpis.totalCustomers || 0}</span>
            <span className="text-[11px] text-slate-400 block mt-1">{kpis.repeatCustomerRate || 0}% Repeat rate</span>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase block">Avg Order Value</span>
            <span className="text-2xl font-black text-slate-900 block mt-1">₹{kpis.averageOrderValue || 0}</span>
            <span className="text-[11px] text-slate-400 block mt-1">₹{kpis.totalDiscountsGiven || 0} discounts given</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif font-bold text-slate-900">Revenue Velocity (Last 30 Days)</h3>
            <p className="text-xs text-slate-500">Calculated directly from stored order values</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#15803d" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(value: any) => [`₹${value}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#15803d" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid: Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-serif font-bold text-slate-900">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-emerald-700 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.recentOrders?.map((ord: any) => (
              <div key={ord._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                <div>
                  <p className="font-mono font-bold text-slate-900">{ord.orderNumber}</p>
                  <p className="text-slate-500">{ord.customerName} • {ord.items?.length || 1} items</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">₹{ord.totalAmount}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {ord.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Catalogue Inventory */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-serif font-bold text-slate-900">Catalogue Highlights</h3>
            <Link to="/admin/products" className="text-xs font-bold text-emerald-700 hover:underline">
              Manage Items
            </Link>
          </div>

          <div className="space-y-3">
            {data?.products?.map((prod: any) => (
              <div key={prod._id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={prod.images?.[0]} alt={prod.name} className="w-10 h-10 object-cover rounded-lg bg-slate-200" />
                  <div>
                    <p className="font-bold text-slate-900 line-clamp-1">{prod.name}</p>
                    <p className="text-slate-500">₹{prod.price} • Stock: {prod.stockQuantity}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prod.availability ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {prod.availability ? 'Available' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
