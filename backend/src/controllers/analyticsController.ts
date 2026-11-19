import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { CouponRedemption } from '../models/CouponRedemption.js';
import { CampaignEvent } from '../models/CampaignEvent.js';

interface DateFilter {
  start: Date;
  end: Date;
}

const parseDateRange = (range?: string, customStart?: string, customEnd?: string): DateFilter => {
  const now = new Date();
  const end = customEnd ? new Date(customEnd) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let start: Date;

  switch (range) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      break;
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      break;
    case 'custom':
      start = customStart ? new Date(customStart) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
  }

  return { start, end };
};

export const getAnalyticsOverview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { range = '30d', startDate, endDate } = req.query;
    const { start, end } = parseDateRange(range as string, startDate as string, endDate as string);

    const orderQuery = {
      createdAt: { $gte: start, $lte: end },
    };

    const validOrderQuery = {
      ...orderQuery,
      orderStatus: { $ne: 'CANCELLED' },
    };

    // Parallel aggregations from real stored records
    const [
      totalOrders,
      validOrders,
      cancelledOrders,
      totalCustomers,
      newCustomers,
      couponsUsedCount,
      allRedemptions,
      orderStatusBreakdown,
    ] = await Promise.all([
      Order.countDocuments(orderQuery),
      Order.find(validOrderQuery),
      Order.countDocuments({ ...orderQuery, orderStatus: 'CANCELLED' }),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', createdAt: { $gte: start, $lte: end } }),
      CouponRedemption.countDocuments({ redeemedAt: { $gte: start, $lte: end } }),
      CouponRedemption.find({ redeemedAt: { $gte: start, $lte: end } }),
      Order.aggregate([
        { $match: orderQuery },
        { $group: { _id: '$orderStatus', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const averageOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
    const totalDiscountsGiven = allRedemptions.reduce((sum, r) => sum + r.discountAmount, 0);

    // Repeat customers calculation: users with >1 valid orders in their history
    const customerOrderCounts = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const repeatCustomerCount = customerOrderCounts.filter((c) => c.count > 1).length;
    const totalOrderingCustomers = customerOrderCounts.length;
    const repeatCustomerRate = totalOrderingCustomers > 0 ? Math.round((repeatCustomerCount / totalOrderingCustomers) * 100) : 0;

    // Time-series daily revenue chart
    const dailyDataMap = new Map<string, { date: string; revenue: number; orders: number }>();
    const curr = new Date(start);
    while (curr <= end) {
      const key = curr.toISOString().slice(0, 10);
      dailyDataMap.set(key, { date: key, revenue: 0, orders: 0 });
      curr.setDate(curr.getDate() + 1);
    }

    validOrders.forEach((o) => {
      const key = o.createdAt.toISOString().slice(0, 10);
      const existing = dailyDataMap.get(key);
      if (existing) {
        existing.revenue += o.totalAmount;
        existing.orders += 1;
      }
    });

    const revenueTimeSeries = Array.from(dailyDataMap.values());

    res.status(200).json({
      success: true,
      data: {
        dateRange: { start, end, label: range },
        kpis: {
          totalRevenue,
          totalOrders,
          validOrdersCount: validOrders.length,
          cancelledOrders,
          totalCustomers,
          newCustomers,
          averageOrderValue,
          repeatCustomerRate,
          couponUsage: couponsUsedCount,
          totalDiscountsGiven,
        },
        revenueTimeSeries,
        orderStatusBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { range = '30d', startDate, endDate } = req.query;
    const { start, end } = parseDateRange(range as string, startDate as string, endDate as string);

    // Revenue by Category & Product
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      orderStatus: { $ne: 'CANCELLED' },
    });

    const categoryRevenueMap: Record<string, number> = {};
    const productRevenueMap: Record<string, { name: string; revenue: number; quantity: number }> = {};

    orders.forEach((o) => {
      o.items.forEach((item) => {
        const cat = item.category || 'Other';
        categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + item.price * item.quantity;

        const prodId = item.productId.toString();
        if (!productRevenueMap[prodId]) {
          productRevenueMap[prodId] = { name: item.name, revenue: 0, quantity: 0 };
        }
        productRevenueMap[prodId].revenue += item.price * item.quantity;
        productRevenueMap[prodId].quantity += item.quantity;
      });
    });

    const revenueByCategory = Object.entries(categoryRevenueMap).map(([category, revenue]) => ({
      category,
      revenue,
    }));

    const revenueByProduct = Object.values(productRevenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        revenueByCategory,
        revenueByProduct,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { range = '30d', startDate, endDate } = req.query;
    const { start, end } = parseDateRange(range as string, startDate as string, endDate as string);

    const breakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const formatted = [
      'ORDER PLACED',
      'ORDER CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'OUT FOR DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ].map((status) => {
      const match = breakdown.find((b) => b._id === status);
      return {
        status,
        count: match ? match.count : 0,
        revenue: match ? match.revenue : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const products = await Product.find().sort({ salesCount: -1 }).limit(20);

    const bestSellers = products.slice(0, 5).map((p) => ({
      name: p.name,
      salesCount: p.salesCount,
      revenue: p.salesCount * p.price,
      viewsCount: p.viewsCount,
      stockQuantity: p.stockQuantity,
      category: p.category,
    }));

    const mostViewed = [...products]
      .sort((a, b) => b.viewsCount - a.viewsCount)
      .slice(0, 5)
      .map((p) => ({
        name: p.name,
        viewsCount: p.viewsCount,
        salesCount: p.salesCount,
        category: p.category,
      }));

    res.status(200).json({
      success: true,
      data: {
        bestSellers,
        mostViewed,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'user' });

    // Location distribution from user addresses or user.location
    const users = await User.find({ role: 'user' }, 'location savedAddresses createdAt');
    const locationMap: Record<string, number> = {};

    users.forEach((u) => {
      const loc = u.location || u.savedAddresses?.[0]?.city || 'Hyderabad';
      locationMap[loc] = (locationMap[loc] || 0) + 1;
    });

    const locationDistribution = Object.entries(locationMap)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        locationDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCouponAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const redemptions = await CouponRedemption.aggregate([
      {
        $group: {
          _id: '$couponCode',
          redemptionsCount: { $sum: 1 },
          totalDiscount: { $sum: '$discountAmount' },
        },
      },
      { $sort: { redemptionsCount: -1 } },
      { $limit: 10 },
    ]);

    // Calculate revenue driven by coupons
    const couponOrders = await Order.aggregate([
      { $match: { couponCode: { $exists: true, $ne: '' }, orderStatus: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: '$couponCode',
          orderRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const performance = redemptions.map((r) => {
      const orderRev = couponOrders.find((co) => co._id === r._id);
      return {
        couponCode: r._id,
        redemptionsCount: r.redemptionsCount,
        totalDiscountGiven: r.totalDiscount,
        revenueGenerated: orderRev ? orderRev.orderRevenue : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: performance,
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Attribution from Orders
    const sourceAttribution = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: { $ifNull: ['$campaignAttribution.utm_source', 'direct'] },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const campaignAttribution = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: { $ifNull: ['$campaignAttribution.utm_campaign', 'organic'] },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        bySource: sourceAttribution.map((s) => ({ source: s._id || 'direct', orders: s.orders, revenue: s.revenue })),
        byCampaign: campaignAttribution.map((c) => ({ campaign: c._id || 'organic', orders: c.orders, revenue: c.revenue })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// CSV Export for Orders
export const exportOrdersCsv = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Subtotal',
      'Delivery Charge',
      'Discount',
      'Coupon Code',
      'Total Amount',
      'Payment Method',
      'Order Status',
      'Courier Name',
      'Tracking Number',
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.createdAt.toISOString()}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerEmail}"`,
      `"${o.customerPhone}"`,
      o.subtotal,
      o.deliveryCharge,
      o.discountAmount,
      `"${o.couponCode || ''}"`,
      o.totalAmount,
      o.paymentMethod,
      `"${o.orderStatus}"`,
      `"${o.courierName || ''}"`,
      `"${o.trackingNumber || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="mitahara-orders-${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// CSV Export for Customers
export const exportCustomersCsv = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });

    const headers = [
      'Customer ID',
      'Name',
      'Email',
      'Phone',
      'Location',
      'PIN Code',
      'Marketing Consent',
      'Registered At',
    ];

    const rows = users.map((u) => [
      `"${u._id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.phone || ''}"`,
      `"${u.location || ''}"`,
      `"${u.pinCode || ''}"`,
      u.marketingConsent ? 'Yes' : 'No',
      `"${u.createdAt.toISOString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="mitahara-customers-${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
