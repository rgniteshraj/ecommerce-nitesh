import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const calculatePrice = (product, quantity) => {
  if (!product.variants || product.variants.length === 0) return 0;

  const variant = product.variants[0]; // Default: first variant
  const discount = (product.discount || 0) / 100;
  const price = variant.price * (1 - discount);

  return price * quantity;
};

export const addToCart = async (req, res) => {

  const { productId, quantity = 1 } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (quantity > product.variants.stock) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.equals(productId));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    console.log(cart);
    
    if (!cart) {
      return res.status(200).json({ items: [], allTotal: 0 });
    }

    // Remove items with deleted products
    cart.items = cart.items.filter(item => item.product);
    await cart.save();

    // Calculate total for each item
    const cartWithPrice = cart.items.map(item => {
      const total = calculatePrice(item.product, item.quantity);
      return {
        ...item.toObject(),
        total
      };
    });

    // Calculate allTotal
    const allTotal = cartWithPrice.reduce((sum, item) => sum + item.total, 0);

    return res.status(200).json({
      items: cartWithPrice,
      allTotal
    });
  } catch (err) {
    console.error('Error in getCart:', err);
    return res.status(500).json({ error: err.message });
  }
};


export const updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });

  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (quantity > item.product.variants.stock) {
      return res.status(400).json({ message: 'Quantity exceeds stock' });
    }

    item.quantity = quantity;
    await cart.save();

    const updatedItem = {
      ...item.toObject(),
      total: calculatePrice(item.product, item.quantity),
    };

    res.status(200).json({ message: 'Quantity updated', item: updatedItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeCartItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => !item._id.equals(itemId));
    await cart.save();
    res.status(200).json({ message: 'Item removed', cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};