import Review from '../models/review.js';
import cloudinary from '../config/cloudinary.js';

// Placeholder for purchase verification logic
const checkIfVerifiedBuyer = async (userId, productId) => {
  // TODO: Implement actual purchase verification
  return true;
};

// Add a new review with media uploads
export const addReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    let mediaFiles = [];
    if (req.files && req.files.length > 0) {
      mediaFiles = req.files.map(file => ({
        url: file.path,        // Cloudinary URL
        public_id: file.filename // Cloudinary public_id
      }));
    }


    // Process uploaded files
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
    
    // Create and save review
    const review = new Review({
      product: productId,
      user: req.user.userId,
      rating,
      title,
      comment,
      media: mediaFiles,
      status: 'approved', // Could be 'pending' for moderation
      verifiedBuyer
    });
    
    await review.save();
    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  console.log("Number of uploaded files:", req.files.length);
};

// Get reviews for a specific product
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      product: req.params.productId, 
      status: 'approved' // Only show approved reviews
    })
    .populate('user', 'name') // Include user name
    .sort({ reviewDate: -1 }); // Newest first
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
};

// Delete a review and associated media
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Delete associated media from Cloudinary
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


