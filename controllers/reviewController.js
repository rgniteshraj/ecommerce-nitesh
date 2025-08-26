import Review from '../models/review.js';

const checkIfVerifiedBuyer = async (_userId, _productId) => {
  return true;
};

export const addReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    const verifiedBuyer = await checkIfVerifiedBuyer(req.user.userId, productId);

    const review = new Review({
      product: productId,
      user: req.user.userId,
      rating,
      title,
      comment,
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
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) return res.status(404).json({ message: 'Review not found' });

    await review.deleteOne();
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

