import mongoose from 'mongoose';

const productDetails = new mongoose.Schema({
  size: String,
  color: String,
  stock: Number,
  price: Number,
  material : String,
  pattern : String,
  occasion : String,
  neckline : String,
  closure : String,
  packSize : String,
  sleeveStyle : String,
  careInstructions : String,
  packCotains : String
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  discount: Number, 
  category: {
    type: String,
    enum: ['men', 'women', 'kids', 'accessories'],
    required: true,
  },
  subcategory: {
    type: String,
    enum: ['men', 'women', 'kids'],
  },
  images: {
    type: [String], 
    default:[]
  },
  variants: [productDetails],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;