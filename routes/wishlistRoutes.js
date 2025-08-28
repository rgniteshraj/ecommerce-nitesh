import express from 'express';
import { addToWishlist, removeFromWishlist, getWishlist } from '../controllers/wishlistController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/add',verifyToken, addToWishlist);
router.delete('/remove/:productId',verifyToken, removeFromWishlist);
router.get('/',verifyToken, getWishlist);

export default router;