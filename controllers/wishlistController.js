// controllers/wishlistController.js
import User from '../models/User.js';

export const addToWishlist = async (req, res) => {
  try {
    const { productId, variantId } = req.body;
    const userId = req.user.id; // from auth middleware

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if product already in wishlist
    const alreadyExists = user.wishlist.find(
      item => item.productId.toString() === productId && 
             (!variantId || item.variantId?.toString() === variantId)
    );

    if (alreadyExists) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    user.wishlist.push({ productId, variantId });
    await user.save();

    res.status(200).json({ message: 'Added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const beforeCount = user.wishlist.length;

    // Remove all items with matching productId
    user.wishlist = user.wishlist.filter(item => item.productId.toString() !== productId);

    const afterCount = user.wishlist.length;

    await user.save();

    if (beforeCount === afterCount) {
      return res.status(404).json({ message: 'Item not found in wishlist', wishlist: user.wishlist });
    }

    res.status(200).json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate('wishlist.productId', 'name image category variants') // include product details
      .populate('wishlist.variantId', 'size color price stock'); // include variant details

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
