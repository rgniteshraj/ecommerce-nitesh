import Review from '../models/review.js';
import cloudinary from '../config/cloudinary.js';

const checkIfVerifiedBuyer = async (userId, productId) => {
  return true;
};

export const addReview = async (req, res) => {
  console.log(req.user.id); // Changed from req.user.userId to req.user.id
  
  try {
    const { productId, rating, title, comment } = req.body;
    let mediaFile = null; // Changed to single object

    // Use req.file instead of req.files (since you're using upload.single())
    if (req.file) {
      // NO NEED TO UPLOAD TO CLOUDINARY AGAIN!
      // Multer + CloudinaryStorage already handled the upload
      mediaFile = {
        url: req.file.path,        // Cloudinary URL from multer
        public_id: req.file.filename // Cloudinary public_id from multer
      };
    }

    const verifiedBuyer = await checkIfVerifiedBuyer(req.user.id, productId); // Changed to req.user.id
    
    const review = new Review({
      product: productId,
      user: req.user.id, // Changed from req.user.userId to req.user.id
      rating,
      title,
      comment,
      media: mediaFile ? [mediaFile] : [], // Wrap single file in array
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
