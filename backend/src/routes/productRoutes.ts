import { Router } from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductById,
  getRelatedProducts,
} from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);

export default router;
