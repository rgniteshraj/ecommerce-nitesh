import express from 'express';
import upload from '../middleware/upload.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  addReview,
  getReviews,
  deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', verifyToken, upload.array('media', 5), addReview);
router.delete('/:reviewId', verifyToken, deleteReview);
router.get('/:productId', getReviews);
export default router;


