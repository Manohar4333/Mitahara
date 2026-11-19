import { Router } from 'express';
import { getCategories, getCategoryProducts } from '../controllers/categoryController.js';

const router = Router();

router.get('/', getCategories);
router.get('/:id/products', getCategoryProducts);

export default router;
