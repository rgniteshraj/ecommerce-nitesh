import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  addReview,
  getReviews,
  deleteReview,
  getProductsSortedByRating
} from '../controllers/reviewController.js';

const router = express.Router();
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post('/', verifyToken, upload.array('media', 5), addReview);
router.get('/:productId', getReviews);
router.delete('/:reviewId', verifyToken, deleteReview);
router.get('/products/sorted-by-rating', getProductsSortedByRating);


export default router;
