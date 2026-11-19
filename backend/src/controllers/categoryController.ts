import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });

    // Attach product counts to each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          $or: [
            { category: { $regex: new RegExp(`^${cat.name}$`, 'i') } },
            { category: { $regex: new RegExp(`^${cat.slug}$`, 'i') } },
          ],
          availability: true,
        });
        return {
          ...cat.toObject(),
          productCount: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);

    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id);
    } else {
      category = await Category.findOne({ slug: id });
    }

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
      return;
    }

    const products = await Product.find({
      $or: [
        { category: category.name },
        { category: category.slug },
        { categoryId: category._id },
      ],
      availability: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      category,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
