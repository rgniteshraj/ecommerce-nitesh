import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, required: true },
  title: { type: String, required: true }, 
  media: [{ type: String , required: true }], 
  reviewDate: { type: Date, default: Date.now },
  comment: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

export default mongoose.model('Review', reviewSchema);
