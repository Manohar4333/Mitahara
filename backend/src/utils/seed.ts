import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { Order } from '../models/Order.js';
import { CouponRedemption } from '../models/CouponRedemption.js';
import { ProductAnalytics } from '../models/ProductAnalytics.js';
import { CampaignEvent } from '../models/CampaignEvent.js';
import { ENV } from '../config/env.js';

export const seedDatabase = async () => {
  try {
    console.log('--- Commencing MITAHARA Database Seed ---');

    // 1. Create or ensure Admin account
    const adminEmail = ENV.ADMIN_EMAIL.toLowerCase();
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: ENV.ADMIN_NAME,
        email: adminEmail,
        phone: '+91 98765 43210',
        location: 'Hyderabad, Telangana',
        pinCode: '500081',
        role: 'admin',
        marketingConsent: true,
        accountStatus: 'active',
        savedAddresses: [
          {
            fullName: ENV.ADMIN_NAME,
            phone: '+91 98765 43210',
            streetAddress: 'Plot 42, Hitech City Main Road, Madhapur',
            city: 'Hyderabad',
            state: 'Telangana',
            postalCode: '500081',
            country: 'India',
            isDefault: true,
          },
        ],
      });
      console.log(`[Seed] Created Admin User: ${adminEmail}`);
    } else {
      admin.role = 'admin';
      await admin.save();
      console.log(`[Seed] Admin User confirmed: ${adminEmail}`);
    }

    // 2. Create Sample Customer User
    const customerEmail = 'customer@mitahara.online';
    let customer = await User.findOne({ email: customerEmail });
    if (!customer) {
      customer = await User.create({
        name: 'Aarav Sharma',
        email: customerEmail,
        phone: '+91 91234 56789',
        location: 'Bangalore, Karnataka',
        pinCode: '560001',
        role: 'user',
        marketingConsent: true,
        accountStatus: 'active',
        savedAddresses: [
          {
            fullName: 'Aarav Sharma',
            phone: '+91 91234 56789',
            streetAddress: 'Flat 302, Green Glen Layout, Bellandur',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560103',
            country: 'India',
            isDefault: true,
          },
        ],
      });
      console.log(`[Seed] Created Sample Customer: ${customerEmail}`);
    }

    // 3. Seed Categories
    const categoriesData = [
      {
        name: 'Rotis & Flatbreads',
        slug: 'rotis',
        description: 'Traditional artisan wholesome rotis handcrafted with stone-ground organic grains.',
        image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
        displayOrder: 1,
      },
      {
        name: 'Millet Breakfasts',
        slug: 'millet-breakfast',
        description: 'Nutrient-rich, fiber-packed breakfasts crafted with native Indian millets.',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        displayOrder: 2,
      },
      {
        name: 'Organic Oatmeal & Bowls',
        slug: 'oat-meal',
        description: 'Wholesome oats blended with dry fruits, cold honey, and super seeds.',
        image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80',
        displayOrder: 3,
      },
      {
        name: 'Cold-Pressed Juices',
        slug: 'juices',
        description: 'Raw, unpasteurized natural wellness elixirs pressed fresh every morning.',
        image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
        displayOrder: 4,
      },
      {
        name: 'Wholesome Curries & Dal',
        slug: 'curries',
        description: 'Slow-simmered organic pulses and garden veggies with zero artificial colors.',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
        displayOrder: 5,
      },
      {
        name: 'Fresh Organic Salads',
        slug: 'salads',
        description: 'Crisp microgreens, sprouted lentils, avocado, and house-made lemon herb vinaigrette.',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
        displayOrder: 6,
      },
      {
        name: 'Millets & Ancient Grains',
        slug: 'millets',
        description: 'Unpolished Foxtail, Kodo, Barnyard, Little and Pearl Millets direct from organic farmers.',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
        displayOrder: 7,
      },
      {
        name: 'Superfoods & Dry Fruits',
        slug: 'superfoods',
        description: 'Premium Kashmiri walnuts, roasted flax, chia seeds, and raw organic wild forest honey.',
        image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80',
        displayOrder: 8,
      },
    ];

    const categoryMap = new Map();
    for (const cat of categoriesData) {
      const existing = await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
      categoryMap.set(cat.name, existing);
    }
    console.log(`[Seed] Seeded ${categoriesData.length} Categories.`);

    // 4. Seed Products
    const productsData = [
      {
        name: 'Jowar Bhakri Roti (Pack of 5)',
        slug: 'jowar-bhakri-roti-pack-of-5',
        category: 'Rotis & Flatbreads',
        description: 'Traditional wood-fired Sorghum (Jowar) flatbreads made with 100% whole grain jowar flour. Naturally gluten-free, light on digestion, and rich in dietary fiber.',
        keyHealthBenefits: ['100% Gluten-Free', 'High Dietary Fiber', 'Controls Blood Sugar Spikes', 'Rich in Iron & Calcium'],
        price: 120,
        originalPrice: 150,
        images: ['https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80'],
        stockQuantity: 45,
        availability: true,
        rating: 4.9,
        reviewsCount: 38,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        unit: 'Pack of 5 Rotis',
        dietaryBadges: ['Gluten Free', 'Zero Maida', 'Heart Healthy'],
        salesCount: 84,
        viewsCount: 290,
      },
      {
        name: 'Organic Ragi Roti (Pack of 5)',
        slug: 'organic-ragi-roti-pack-of-5',
        category: 'Rotis & Flatbreads',
        description: 'Wholesome Finger Millet (Ragi) rotis prepared with organic ragi flour, cumin seeds, and finely chopped curry leaves. A calcium powerhouse for bone health.',
        keyHealthBenefits: ['Exceptional Calcium Source', 'Boosts Stamina & Energy', 'Low Glycemic Index', 'Pure Farm Fresh Grain'],
        price: 130,
        originalPrice: 160,
        images: ['https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80'],
        stockQuantity: 30,
        availability: true,
        rating: 4.8,
        reviewsCount: 29,
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        unit: 'Pack of 5 Rotis',
        dietaryBadges: ['Rich in Calcium', 'Zero Preservatives'],
        salesCount: 62,
        viewsCount: 215,
      },
      {
        name: 'Foxtail Millet Upma Meal',
        slug: 'foxtail-millet-upma-meal',
        category: 'Millet Breakfasts',
        description: 'A comforting, warm breakfast bowl of roasted Foxtail Millet tossed with garden peas, organic carrots, mustard seeds, and roasted cashew nuts in cold-pressed groundnut oil.',
        keyHealthBenefits: ['Rich in Complex Carbs', 'Prevents Morning Energy Dips', 'Good for Nervous System', 'High in Vitamin B12'],
        price: 160,
        originalPrice: 190,
        images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'],
        stockQuantity: 25,
        availability: true,
        rating: 4.7,
        reviewsCount: 42,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        unit: 'Single 350g Meal Bowl',
        dietaryBadges: ['Vegan', 'Low GI', 'Nutritionist Approved'],
        salesCount: 95,
        viewsCount: 340,
      },
      {
        name: 'Little Millet Steamed Idli (4 pcs)',
        slug: 'little-millet-steamed-idli-4-pcs',
        category: 'Millet Breakfasts',
        description: 'Light, fluffy fermented idlis prepared with stone-ground Little Millet and whole urad dal. Served with roasted chana coconut chutney and sambar.',
        keyHealthBenefits: ['Supports Gut Microbiome', 'Naturally Probiotic', 'Easily Digestible', 'Diabetic Friendly'],
        price: 140,
        originalPrice: 170,
        images: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'],
        stockQuantity: 20,
        availability: true,
        rating: 4.9,
        reviewsCount: 51,
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false,
        unit: '4 Pieces + Chutney',
        dietaryBadges: ['Probiotic Fermented', 'Gluten Free'],
        salesCount: 112,
        viewsCount: 410,
      },
      {
        name: 'Wild Berry Chia Oatmeal Bowl',
        slug: 'wild-berry-chia-oatmeal-bowl',
        category: 'Organic Oatmeal & Bowls',
        description: 'Rolled organic oats simmered in almond milk, topped with blueberries, wild strawberries, roasted chia seeds, crushed almonds, and organic Kashmiri honey.',
        keyHealthBenefits: ['Rich in Antioxidants', 'High in Omega-3 Fatty Acids', 'Promotes Satiety & Weight Balance', 'Zero Refined Sugars'],
        price: 210,
        originalPrice: 250,
        images: ['https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80'],
        stockQuantity: 40,
        availability: true,
        rating: 4.9,
        reviewsCount: 65,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        unit: '380g Bowl',
        dietaryBadges: ['Plant Powered', 'Antioxidant Rich'],
        salesCount: 130,
        viewsCount: 480,
      },
      {
        name: 'Green Vitality Cold-Pressed Detox Juice',
        slug: 'green-vitality-cold-pressed-detox-juice',
        category: 'Cold-Pressed Juices',
        description: 'Hydrating cellular detox juice pressed from fresh organic spinach, cucumber, celery, green apple, ginger, and a dash of Himalayan pink rock salt. Never heated, never pasteurized.',
        keyHealthBenefits: ['Flushes Toxins Naturally', 'Alkalizes the Body', 'Enhances Skin Radiance', 'Packed with Bioactive Chlorophyll'],
        price: 150,
        originalPrice: 180,
        images: ['https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80'],
        stockQuantity: 35,
        availability: true,
        rating: 4.8,
        reviewsCount: 34,
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        unit: '300ml Cold Bottle',
        dietaryBadges: ['100% Raw Juice', 'No Added Sugar'],
        salesCount: 78,
        viewsCount: 260,
      },
      {
        name: 'Royal ABC Juice (Apple, Beetroot, Carrot)',
        slug: 'royal-abc-juice',
        category: 'Cold-Pressed Juices',
        description: 'The miracle wellness juice blend: Crisp Himachali apples, organic ruby red beetroots, sweet carrots, and fresh lemon juice. Boosts hemoglobin and vital energy.',
        keyHealthBenefits: ['Improves Hemoglobin Levels', 'Natural Liver Cleanser', 'High Vitamin A & C', 'Boosts Immunity & Stamina'],
        price: 160,
        originalPrice: 190,
        images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'],
        stockQuantity: 50,
        availability: true,
        rating: 5.0,
        reviewsCount: 72,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        unit: '300ml Cold Bottle',
        dietaryBadges: ['Immunity Booster', 'Zero Additives'],
        salesCount: 156,
        viewsCount: 520,
      },
      {
        name: 'Sprouted Green Moong & Spinach Curry',
        slug: 'sprouted-green-moong-curry',
        category: 'Wholesome Curries & Dal',
        description: 'Nutritious sprouted green gram slow-cooked with tender baby spinach leaves, crushed ginger, cumin, and mild home-ground spices in cold-pressed mustard oil.',
        keyHealthBenefits: ['Easily Digestible Plant Protein', 'Supports Muscle Repair', 'High Bioavailable Iron', 'Low Calorie & Nutrient Dense'],
        price: 180,
        originalPrice: 220,
        images: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80'],
        stockQuantity: 28,
        availability: true,
        rating: 4.8,
        reviewsCount: 22,
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
        unit: '400g Meal Portion',
        dietaryBadges: ['High Protein', 'Sprouted Goodness'],
        salesCount: 45,
        viewsCount: 190,
      },
      {
        name: 'Mediterranean Sprouted Quinoa Salad',
        slug: 'mediterranean-sprouted-quinoa-salad',
        category: 'Fresh Organic Salads',
        description: 'Cooked organic white quinoa tossed with cherry tomatoes, Persian cucumbers, Kalamata olives, toasted pumpkin seeds, and cold-pressed extra virgin olive oil vinaigrette.',
        keyHealthBenefits: ['Complete Amino Acid Profile', 'Rich in Heart-Healthy Fats', 'Hydrating & Refreshing', 'Supports Gut Microbiome'],
        price: 220,
        originalPrice: 260,
        images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'],
        stockQuantity: 22,
        availability: true,
        rating: 4.9,
        reviewsCount: 48,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        unit: '350g Salad Bowl',
        dietaryBadges: ['Superfood Salad', 'Heart Healthy'],
        salesCount: 92,
        viewsCount: 310,
      },
      {
        name: 'Unpolished Organic Barnyard Millet (Sanwa)',
        slug: 'unpolished-organic-barnyard-millet',
        category: 'Millets & Ancient Grains',
        description: 'Pure, unpolished native Barnyard Millet (Sanwa/Jhangora). Ideal for preparing healthy khichdi, porridge, and fasting pilafs. 6x more fiber than polished white rice.',
        keyHealthBenefits: ['6x Dietary Fiber of White Rice', 'Low Caloric Density', 'Rich in Phosphorous & Zinc', 'Naturally Pest Resistant'],
        price: 190,
        originalPrice: 230,
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'],
        stockQuantity: 60,
        availability: true,
        rating: 4.9,
        reviewsCount: 31,
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
        unit: '1 kg Pouch',
        dietaryBadges: ['Unpolished Whole Grain', 'Farm Certified'],
        salesCount: 54,
        viewsCount: 220,
      },
      {
        name: 'Raw Kashmiri Forest Honey (500g)',
        slug: 'raw-kashmiri-forest-honey-500g',
        category: 'Superfoods & Dry Fruits',
        description: 'Unfiltered, unpasteurized monofloral forest honey harvested from wild blossoms in the pristine Kashmir valley. Loaded with live enzymes, pollen, and propolis.',
        keyHealthBenefits: ['Live Antibacterial Enzymes', 'Natural Cough & Sore Throat Remedy', 'Zero High-Fructose Corn Syrup', 'Sustained Clean Energy'],
        price: 390,
        originalPrice: 450,
        images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80'],
        stockQuantity: 40,
        availability: true,
        rating: 5.0,
        reviewsCount: 88,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        unit: '500g Glass Jar',
        dietaryBadges: ['Unpasteurized', 'Raw Wild Forest'],
        salesCount: 142,
        viewsCount: 610,
      },
      {
        name: 'Roasted 7-Seed Superfood Mix (250g)',
        slug: 'roasted-7-seed-superfood-mix',
        category: 'Superfoods & Dry Fruits',
        description: 'A light, crunchy dry-roasted blend of Pumpkin, Sunflower, Chia, Flax, Watermelon, Sesame, and Muskmelon seeds, delicately seasoned with Himalayan pink rock salt.',
        keyHealthBenefits: ['Optimal Zinc & Magnesium', 'Plant-Based Omega-3', 'Boosts Hair & Skin Vitality', 'Guilt-Free Healthy Snack'],
        price: 240,
        originalPrice: 280,
        images: ['https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80'],
        stockQuantity: 35,
        availability: true,
        rating: 4.8,
        reviewsCount: 46,
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        unit: '250g Zip Pouch',
        dietaryBadges: ['Keto Friendly', 'Roasted Without Oil'],
        salesCount: 88,
        viewsCount: 305,
      },
    ];

    for (const prod of productsData) {
      await Product.findOneAndUpdate({ slug: prod.slug }, prod, { upsert: true, new: true });
    }
    console.log(`[Seed] Seeded ${productsData.length} Products.`);

    // 5. Seed Coupons (from prompt requirements: WELCOME10, SAVE50, MITAHARA20)
    const couponsData = [
      {
        couponCode: 'WELCOME10',
        description: '10% discount on your first healthy order.',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 200,
        maxDiscountAmount: 100,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        totalUsageLimit: 5000,
        timesUsed: 14,
        perUserUsageLimit: 1,
        isActive: true,
      },
      {
        couponCode: 'SAVE50',
        description: 'Flat ₹50 off on orders above ₹250.',
        discountType: 'fixed',
        discountValue: 50,
        minOrderAmount: 250,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        totalUsageLimit: 3000,
        timesUsed: 22,
        perUserUsageLimit: 2,
        isActive: true,
      },
      {
        couponCode: 'MITAHARA20',
        description: '20% off with maximum discount up to ₹150.',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 400,
        maxDiscountAmount: 150,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        totalUsageLimit: 2000,
        timesUsed: 8,
        perUserUsageLimit: 1,
        isActive: true,
      },
    ];

    for (const coup of couponsData) {
      await Coupon.findOneAndUpdate({ couponCode: coup.couponCode }, coup, { upsert: true, new: true });
    }
    console.log(`[Seed] Seeded ${couponsData.length} Coupons.`);

    // 6. Seed Sample Orders with authentic status history & internal tracking
    const existingOrdersCount = await Order.countDocuments();
    if (existingOrdersCount === 0 && customer) {
      const sampleOrders = [
        {
          orderNumber: 'MTH-20261110-1842',
          userId: customer._id,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          items: [
            {
              productId: (await Product.findOne({ slug: 'wild-berry-chia-oatmeal-bowl' }))?._id,
              name: 'Wild Berry Chia Oatmeal Bowl',
              price: 210,
              quantity: 2,
              image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80',
              unit: '380g Bowl',
              category: 'Organic Oatmeal & Bowls',
            },
            {
              productId: (await Product.findOne({ slug: 'royal-abc-juice' }))?._id,
              name: 'Royal ABC Juice (Apple, Beetroot, Carrot)',
              price: 160,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
              unit: '300ml Cold Bottle',
              category: 'Cold-Pressed Juices',
            },
          ],
          shippingAddress: customer.savedAddresses[0],
          subtotal: 580,
          deliveryCharge: 24,
          couponCode: 'SAVE50',
          discountAmount: 50,
          gst: 0,
          totalAmount: 554, // 580 + 24 - 50 = 554
          paymentMethod: 'COD',
          paymentStatus: 'PAID',
          orderStatus: 'DELIVERED',
          courierName: 'Mitahara Green Express',
          trackingNumber: 'MGX-982143',
          estimatedDeliveryDate: new Date('2026-11-12T14:00:00Z'),
          statusHistory: [
            {
              status: 'ORDER PLACED',
              message: 'Order received and recorded into our organic kitchen queue.',
              updatedBy: 'customer',
              updatedAt: new Date('2026-11-10T09:15:00Z'),
            },
            {
              status: 'ORDER CONFIRMED',
              message: 'Order reviewed and confirmed by head nutritionist.',
              updatedBy: 'Mitahara Admin',
              updatedAt: new Date('2026-11-10T09:45:00Z'),
            },
            {
              status: 'PROCESSING',
              message: 'Ingredients freshly gathered and packed in biodegradable boxes.',
              updatedBy: 'Mitahara Kitchen',
              updatedAt: new Date('2026-11-11T08:30:00Z'),
            },
            {
              status: 'SHIPPED',
              message: 'Handed over to Mitahara temperature-controlled courier team.',
              updatedBy: 'Mitahara Dispatch',
              updatedAt: new Date('2026-11-11T12:00:00Z'),
            },
            {
              status: 'OUT FOR DELIVERY',
              message: 'Delivery partner Sunil is out for delivery in your area.',
              updatedBy: 'Mitahara Logistics',
              updatedAt: new Date('2026-11-12T10:00:00Z'),
            },
            {
              status: 'DELIVERED',
              message: 'Package handed over safely. Enjoy your wholesome meals!',
              updatedBy: 'Sunil (Courier)',
              updatedAt: new Date('2026-11-12T13:40:00Z'),
            },
          ],
          campaignAttribution: {
            utm_source: 'google',
            utm_medium: 'cpc',
            utm_campaign: 'healthy_morning',
          },
          createdAt: new Date('2026-11-10T09:15:00Z'),
        },
        {
          orderNumber: 'MTH-20261116-2940',
          userId: customer._id,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          items: [
            {
              productId: (await Product.findOne({ slug: 'raw-kashmiri-forest-honey-500g' }))?._id,
              name: 'Raw Kashmiri Forest Honey (500g)',
              price: 390,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
              unit: '500g Glass Jar',
              category: 'Superfoods & Dry Fruits',
            },
            {
              productId: (await Product.findOne({ slug: 'jowar-bhakri-roti-pack-of-5' }))?._id,
              name: 'Jowar Bhakri Roti (Pack of 5)',
              price: 120,
              quantity: 2,
              image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
              unit: 'Pack of 5 Rotis',
              category: 'Rotis & Flatbreads',
            },
          ],
          shippingAddress: customer.savedAddresses[0],
          subtotal: 630,
          deliveryCharge: 24,
          couponCode: 'MITAHARA20',
          discountAmount: 126,
          gst: 0,
          totalAmount: 528, // 630 + 24 - 126 = 528
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          orderStatus: 'SHIPPED',
          courierName: 'Mitahara Green Express',
          trackingNumber: 'MGX-847291',
          estimatedDeliveryDate: new Date('2026-11-19T18:00:00Z'),
          statusHistory: [
            {
              status: 'ORDER PLACED',
              message: 'Order received and waiting for merchant confirmation.',
              updatedBy: 'customer',
              updatedAt: new Date('2026-11-16T14:20:00Z'),
            },
            {
              status: 'ORDER CONFIRMED',
              message: 'Order confirmed and scheduled for fresh batch packaging.',
              updatedBy: 'Mitahara Admin',
              updatedAt: new Date('2026-11-16T15:00:00Z'),
            },
            {
              status: 'PROCESSING',
              message: 'Raw Honey jar carefully bubble wrapped in eco-corrugated paper.',
              updatedBy: 'Mitahara Packing',
              updatedAt: new Date('2026-11-17T10:00:00Z'),
            },
            {
              status: 'SHIPPED',
              message: 'Order dispatched with courier partner. In transit.',
              updatedBy: 'Mitahara Admin',
              updatedAt: new Date('2026-11-17T16:30:00Z'),
            },
          ],
          campaignAttribution: {
            utm_source: 'instagram',
            utm_medium: 'organic_social',
            utm_campaign: 'wellness_superfoods',
          },
          createdAt: new Date('2026-11-16T14:20:00Z'),
        },
      ];

      for (const ord of sampleOrders) {
        await Order.create(ord);
      }
      console.log(`[Seed] Seeded ${sampleOrders.length} sample Orders with status histories.`);
    }

    console.log('--- MITAHARA Database Seed Completed Successfully ---');
  } catch (error) {
    console.error('Error during database seed:', error);
  }
};

// If run directly via command line
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  })();
}
