import Review from '../models/review.js';
import cloudinary from '../config/cloudinary.js';

const checkIfVerifiedBuyer = async (userId, productId) => {
  // TODO: replace with real logic (e.g., check orders collection)
  return true;
};

export const addReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    let mediaFiles = [];

    if (req.files && req.files.length > 0) {
      mediaFiles = req.files.map(file => ({
        url: file.path,       // this is Cloudinary URL
        public_id: file.filename // this is Cloudinary public_id
      }));
    }
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'reviews'
        });
        mediaFiles.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    }

    const verifiedBuyer = await checkIfVerifiedBuyer(req.user.userId, productId);
    const review = new Review({
      product: productId,
      user: req.user.userId,
      rating,
      title,
      comment,
      media: mediaFiles,
      status: 'approved', // change to 'pending' if you want moderation
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

