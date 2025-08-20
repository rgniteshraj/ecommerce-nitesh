import Review from '../models/review.js';
import cloudinary from '../config/cloudinary.js';

const checkIfVerifiedBuyer = async (userId, productId) => {
  return true;
};

export const addReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    console.log("Files uploaded:", req.files);

    const mediaFiles = req.files ? req.files.map(file => ({
      url: file.path,              // Cloudinary URL
      public_id: file.filename     // Cloudinary public_id (depends on config)
    })) : [];

    const verifiedBuyer = await checkIfVerifiedBuyer(req.user.id, productId);

    const review = new Review({
      product: productId,
      user: req.user.id,
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
    console.error("Error in addReview:", error);
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

    if (review.media?.length) {
      for (const file of review.media) {
        await cloudinary.uploader.destroy(file.public_id);
      }

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
