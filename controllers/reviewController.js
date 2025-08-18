import Review from '../models/review.js';
//import Product from '../models/product.js';
import user from '../models/User.js';
import path from 'path';
import fs from 'fs';

const checkIfVerifiedBuyer = async (userId, productId) => {
  return true; 
};

export const addReview = async (req, res) => {
  try {
    const { productId, rating, title, comment ,media} = req.body;
    const mediaFiles = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const verifiedBuyer = await checkIfVerifiedBuyer(req.user.userId, productId);
    const review = new Review({
      product: productId,
      user: req.user.userId,
      rating,
      title,
      comment,
      media: mediaFiles,
      status: 'approved', 
      verifiedBuyer
    });
    await review.save();
    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, status: 'approved' })
      .populate('user', 'name')
      .sort({ reviewDate: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
};
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) return res.status(404).json({ message: 'Review not found' });

    // if (req.user.role !== 'admin' && review.user.toString() !== req.user.userId) {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }

    if (review.media?.length) {
      review.media.forEach(filePath => {
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductsSortedByRating = async (req, res) => {
  try {
    const products = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' } } },
      { $sort: { avgRating: -1 } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      }
    ]);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
