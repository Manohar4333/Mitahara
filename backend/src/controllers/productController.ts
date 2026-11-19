import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product.js';
import { ProductAnalytics } from '../models/ProductAnalytics.js';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      availableOnly,
      sort = 'newest',
      page = '1',
      limit = '12',
      isFeatured,
      isBestSeller,
      isNewArrival,
    } = req.query;

    const query: any = {};

    // Search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = search.trim();
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { keyHealthBenefits: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
      ];
    }

    // Category filter
    if (category && typeof category === 'string' && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Availability filter
    if (availableOnly === 'true') {
      query.availability = true;
      query.stockQuantity = { $gt: 0 };
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Specific flags
    if (isFeatured === 'true') query.isFeatured = true;
    if (isBestSeller === 'true') query.isBestSeller = true;
    if (isNewArrival === 'true') query.isNewArrival = true;

    // Sorting
    let sortOptions: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };
    else if (sort === 'popular') sortOptions = { salesCount: -1 };

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionSeed, limit = '8' } = req.query;
    const limitNum = Math.max(1, Math.min(20, parseInt(limit as string, 10)));

    // Fetch available products
    const availableProducts = await Product.find({ availability: true, stockQuantity: { $gt: 0 } });

    if (availableProducts.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    // If sessionSeed is provided, deterministically shuffle based on seed so it stays stable during session
    let seedVal = 42;
    if (sessionSeed && typeof sessionSeed === 'string') {
      seedVal = sessionSeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    }

    // Pseudo-random deterministic shuffle using seed
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const shuffled = [...availableProducts].sort((a, b) => {
      const aHash = pseudoRandom(seedVal + a._id.toString().charCodeAt(0));
      const bHash = pseudoRandom(seedVal + b._id.toString().charCodeAt(0));
      return aHash - bHash;
    });

    const selected = shuffled.slice(0, limitNum);

    res.status(200).json({
      success: true,
      data: selected,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);

    // Support lookup by either ObjectId or slug
    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    } else {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
      return;
    }

    // Async view increment (fire & forget so API remains snappy)
    Product.updateOne({ _id: product._id }, { $inc: { viewsCount: 1 } }).exec();
    ProductAnalytics.findOneAndUpdate(
      { productId: product._id },
      { $inc: { views: 1 }, $set: { lastViewedAt: new Date() } },
      { upsert: true }
    ).exec();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getRelatedProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const current = await Product.findById(id);
    if (!current) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const related = await Product.find({
      category: current.category,
      _id: { $ne: current._id },
      availability: true,
    })
      .limit(4)
      .sort({ rating: -1 });

    res.status(200).json({
      success: true,
      data: related,
    });
  } catch (error) {
    next(error);
  }
};
