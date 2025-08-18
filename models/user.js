import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  mobile: { type: String, unique: true, required: true },
  otp: String,
  otpExpires: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;