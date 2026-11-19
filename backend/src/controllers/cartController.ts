import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { ProductAnalytics } from '../models/ProductAnalytics.js';

export const getCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    let cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // Filter out deleted products and compute live subtotal
    const items = [];
    let subtotal = 0;
    let hasModified = false;

    for (const item of cart.items) {
      const product: any = item.productId;
      if (product && product.availability) {
        items.push({
          productId: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images?.[0] || '',
          unit: product.unit,
          category: product.category,
          quantity: item.quantity,
          stockQuantity: product.stockQuantity,
          total: product.price * item.quantity,
        });
        subtotal += product.price * item.quantity;
      } else {
        hasModified = true;
      }
    }

    if (hasModified) {
      cart.items = cart.items.filter((item: any) => item.productId && item.productId.availability);
      await cart.save();
    }

    const deliveryCharge = 24; // ₹24 fixed per prompt
    const gst = 0; // ₹0 charged per prompt
    const total = subtotal > 0 ? subtotal + deliveryCharge : 0;

    res.status(200).json({
      success: true,
      data: {
        items,
        itemCount: items.reduce((sum, it) => sum + it.quantity, 0),
        subtotal,
        deliveryCharge,
        gst,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.availability || product.stockQuantity < 1) {
      res.status(400).json({
        success: false,
        message: 'Product is currently unavailable or out of stock.',
      });
      return;
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (it) => it.productId.toString() === productId.toString()
    );

    const qtyToAdd = Math.max(1, parseInt(quantity, 10));

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + qtyToAdd;
      if (newQty > product.stockQuantity) {
        res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stockQuantity} items in stock.`,
        });
        return;
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].priceSnapshot = product.price;
    } else {
      if (qtyToAdd > product.stockQuantity) {
        res.status(400).json({
          success: false,
          message: `Only ${product.stockQuantity} items in stock.`,
        });
        return;
      }
      cart.items.push({
        productId: product._id as any,
        quantity: qtyToAdd,
        priceSnapshot: product.price,
      });
    }

    await cart.save();

    // Async track cart adds for product analytics
    ProductAnalytics.findOneAndUpdate(
      { productId: product._id },
      { $inc: { cartAdds: qtyToAdd } },
      { upsert: true }
    ).exec();

    // Return updated cart
    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const updateCartItemQuantity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { productId } = req.params;
    const { quantity } = req.body;

    const newQty = parseInt(quantity, 10);
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found.' });
      return;
    }

    if (newQty <= 0) {
      cart.items = cart.items.filter((it) => it.productId.toString() !== productId.toString());
    } else {
      const product = await Product.findById(productId);
      if (product && newQty > product.stockQuantity) {
        res.status(400).json({
          success: false,
          message: `Maximum stock available is ${product.stockQuantity}.`,
        });
        return;
      }

      const item = cart.items.find((it) => it.productId.toString() === productId.toString());
      if (item) {
        item.quantity = newQty;
        if (product) item.priceSnapshot = product.price;
      }
    }

    await cart.save();
    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = cart.items.filter((it) => it.productId.toString() !== productId.toString());
      await cart.save();
    }

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    await Cart.findOneAndUpdate({ userId }, { items: [] });
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.',
      data: {
        items: [],
        itemCount: 0,
        subtotal: 0,
        deliveryCharge: 24,
        gst: 0,
        total: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
