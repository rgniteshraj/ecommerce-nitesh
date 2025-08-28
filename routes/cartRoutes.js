import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem
} from '../controllers/cartController.js';

const router = express.Router();

router.post('/add',verifyToken, addToCart);
router.get('/',verifyToken, getCart);
router.put('/update/:itemId',verifyToken, updateCartItem);
router.delete('/remove/:itemId',verifyToken, removeCartItem);

export default router;