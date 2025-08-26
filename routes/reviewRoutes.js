import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  addReview,
  getReviews,
  deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', verifyToken, addReview);
router.delete('/:reviewId', verifyToken, deleteReview);
router.get('/:productId', getReviews);

export default router;




