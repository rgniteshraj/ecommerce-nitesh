import Review from '../models/review.js';
import cloudinary from '../config/cloudinary.js';

const checkIfVerifiedBuyer = async (userId, productId) => {
  // TODO: replace with real logic (e.g., check orders collection)
  return true;
};

export const addReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    let mediaFile = null;

    if (req.file) { // only ONE file allowed
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "reviews",
      });
      mediaFile = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    const verifiedBuyer = await checkIfVerifiedBuyer(req.user.userId, productId);

    const review = new Review({
      product: productId,
      user: req.user.userId,
      rating,
      title,
      comment,
      media: mediaFile, // single object (not array)
      status: "approved", 
      verifiedBuyer,
    });

    await review.save();
    res.status(201).json({ message: "Review submitted successfully", review });
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
    if (review.media?.length) {
      for (const file of review.media) {
        if (file.public_id) {
          await cloudinary.uploader.destroy(file.public_id);
        }
      }
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

