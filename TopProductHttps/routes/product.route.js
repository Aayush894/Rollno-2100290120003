import { Router } from "express"; 
import {
    categoryController,
    productController
} from '../controllers/product.controller.js';

const router = Router();

router.route('/categories/:categoryname/products').get(categoryController);
router.route('/categories/:categoryname/products/:productid').get(productController);

export default router;