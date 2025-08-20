import Product from '../models/product.js';
import cloudinary from '../config/cloudinary.js';

// GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category } = req.query;
    const filter = {
      ...(search && { name: { $regex: search, $options: 'i' } }),
      ...(category && { category }),
    };

    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, subcategory, variants } = req.body;

    let parsedVariants = [];
    try {
      parsedVariants = variants ? JSON.parse(variants) : [];
    } catch (e) {
      return res.status(400).json({ message: 'Invalid JSON format for variants.' });
    }

    const images = req.files ? req.files.map(file => ({
      url: file.path,        // Cloudinary URL
      public_id: file.filename // Cloudinary public_id
    })) : [];

    const product = new Product({
      name,
      description,
      category,
      subcategory,
      images,
      variants: parsedVariants
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const { name, description, category, subcategory, variants } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // If a new images is uploaded
    if (req.files && req.files.length > 0) {
      for (const img of product.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      product.images = req.files.map(file => ({
        url: file.path,
        public_id: file.filename
      }));
    }

    // Update other fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (subcategory) product.subcategory = subcategory;
    if (variants) product.variants = JSON.parse(variants); // if provided

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};