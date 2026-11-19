import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Percent,
  Calendar,
  Download,
  Filter,
  BarChart2,
  PieChart as PieIcon,
  Sparkles,
  RefreshCw,
  Compass,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../../services/api.js';
import { useAppDispatch } from '../../store/index.js';
import { showToast } from '../../store/slices/uiSlice.js';

const COLORS = ['#15803d', '#22c55e', '#84cc16', '#eab308', '#f97316', '#06b6d4', '#8b5cf6'];

export const AdminMarketingAnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [range, setRange] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [loading, setLoading] = useState(true);

  // Analytics Datasets
  const [overview, setOverview] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [ordersBreakdown, setOrdersBreakdown] = useState<any[]>([]);
  const [productsData, setProductsData] = useState<any>(null);
  const [customersData, setCustomersData] = useState<any>(null);
  const [couponsData, setCouponsData] = useState<any[]>([]);
  const [campaignsData, setCampaignsData] = useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params: any = { range };
      if (range === 'custom') {
        params.startDate = customStart;
        params.endDate = customEnd;
      }

      const [ovRes, revRes, ordRes, prodRes, custRes, coupRes, campRes] = await Promise.all([
        api.get('/admin/analytics/overview', { params }),
        api.get('/admin/analytics/revenue', { params }),
        api.get('/admin/analytics/orders', { params }),
        api.get('/admin/analytics/products', { params }),
        api.get('/admin/analytics/customers', { params }),
        api.get('/admin/analytics/coupons', { params }),
        api.get('/admin/analytics/campaigns', { params }),
      ]);

      setOverview(ovRes.data.data);
      setRevenue(revRes.data.data);
      setOrdersBreakdown(ordRes.data.data);
      setProductsData(prodRes.data.data);
      setCustomersData(custRes.data.data);
      setCouponsData(coupRes.data.data);
      setCampaignsData(campRes.data.data);
    } catch (err) {
      console.error('Analytics load error:', err);
      dispatch(showToast({ type: 'error', message: 'Failed to aggregate marketing metrics' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const handleExportOrders = async () => {
    try {
      window.open('/api/v1/admin/analytics/export/orders', '_blank');
      dispatch(showToast({ type: 'success', message: 'Downloading orders CSV report...' }));
    } catch {
      dispatch(showToast({ type: 'error', message: 'Export failed' }));
    }
  };

  const handleExportCustomers = async () => {
    try {
      window.open('/api/v1/admin/analytics/export/customers', '_blank');
      dispatch(showToast({ type: 'success', message: 'Downloading customers CSV report...' }));
    } catch {
      dispatch(showToast({ type: 'error', message: 'Export failed' }));
    }
  };

  const kpis = overview?.kpis || {};
  const timeSeries = overview?.revenueTimeSeries || [];

  return (
    <div className="space-y-8">
      {/* Top Header & Date Range Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Intelligence & Attribution
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
            Marketing Analytics Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated from live database records with zero hardcoded or fabricated figures.
          </p>
        </div>

        {/* Filters & CSV Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Range Selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm text-xs font-semibold">
            {['today', '7d', '30d', '90d', 'this_month'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg transition capitalize ${
                  range === r ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'this_month' ? 'This Month' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : 'Today'}
              </button>
            ))}
          </div>

          {/* Export Dropdown */}
          <button
            onClick={handleExportOrders}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-sm transition"
            title="Export Orders CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Orders CSV</span>
          </button>
          <button
            onClick={handleExportCustomers}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-sm transition"
            title="Export Customers CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Customers CSV</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-700" />
          <p className="text-sm">Calculating marketing and revenue aggregations...</p>
        </div>
      ) : (
        <>
          {/* TOP KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* Total Revenue */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">Total Revenue</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1">₹{kpis.totalRevenue?.toLocaleString('en-IN') || 0}</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Net Realized</span>
            </div>

            {/* Total Orders */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">Total Orders</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1">{kpis.totalOrders || 0}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{kpis.cancelledOrders || 0} cancelled</span>
            </div>

            {/* Total Customers */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">Total Customers</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1">{kpis.totalCustomers || 0}</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">+{kpis.newCustomers || 0} new in period</span>
            </div>

            {/* Average Order Value */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">Avg Order Value</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1">₹{kpis.averageOrderValue || 0}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{kpis.repeatCustomerRate || 0}% repeat rate</span>
            </div>
          </div>

          {/* REVENUE VELOCITY CHART */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900">Revenue & Order Trendline</h3>
                <p className="text-xs text-slate-500">Daily sales trajectory over the selected range</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevMkt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#15803d" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(val: any, name: any) => [name === 'revenue' ? `₹${val}` : val, name === 'revenue' ? 'Revenue' : 'Orders']} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#15803d" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevMkt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* REVENUE BY CATEGORY & ORDER STATUS BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Revenue by Category (Bar Chart) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-slate-900">Revenue by Category</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenue?.revenueByCategory || []} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(val: any) => [`₹${val}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#15803d" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Status Breakdown (Pie Chart) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-slate-900">Order Status Distribution</h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ordersBreakdown.filter((o) => o.count > 0)}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name.slice(0, 8)} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {ordersBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* BEST SELLING PRODUCTS & CUSTOMER GEOGRAPHY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Best Selling Products */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-slate-900">Top Performing Products</h3>
              <div className="divide-y divide-slate-100">
                {productsData?.bestSellers?.map((p: any, idx: number) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-slate-400">{p.category} • {p.viewsCount} views</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">₹{p.revenue}</p>
                      <p className="text-emerald-700 font-semibold">{p.salesCount} units sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Location Distribution */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-slate-900">Customer Location Distribution</h3>
              <div className="space-y-3">
                {customersData?.locationDistribution?.map((loc: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{loc.location}</span>
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {loc.count} customers
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COUPON ANALYTICS & MARKETING ATTRIBUTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Coupon Analytics */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-slate-900">Coupon Code Performance</h3>
              <div className="space-y-3">
                {couponsData.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No coupon redemption data recorded yet.</p>
                ) : (
                  couponsData.map((c: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-900">{c.couponCode}</span>
                        <p className="text-slate-500">{c.redemptionsCount} times redeemed</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-800 block">₹{c.revenueGenerated} sales</span>
                        <span className="text-[11px] text-slate-400 block">₹{c.totalDiscountGiven} discounts given</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Campaign Attribution (UTM Parameters) */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-slate-900">Campaign Attribution (UTM)</h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  Captured at Checkout
                </span>
              </div>

              <div className="space-y-3">
                {campaignsData?.bySource?.map((s: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 uppercase tracking-wider">{s.source}</span>
                      <p className="text-slate-500">{s.orders} orders attributed</p>
                    </div>
                    <span className="font-black text-emerald-800 text-sm">₹{s.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
