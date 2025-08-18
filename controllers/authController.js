import dotenv from 'dotenv';
dotenv.config({ override: true });

import twilio from 'twilio';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Step 1: Request OTP (Register or Login)
export const requestOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    console.log(mobile);
    
    if (!mobile) return res.status(400).json({ message: 'Mobile number required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 min validity

    let user = await User.findOne({ mobile });
    if (!user) {
      user = new User({ mobile });
    }
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
    console.log(user);
    
    // Send OTP via SMS
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: mobile
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.log("Twilio error ",error);
    
    res.status(500).json({ error: error.message });
  }
};

// Step 2: Verify OTP & Generate Token
export const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const user = await User.findOne({ mobile });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otpExpires < Date.now()) return res.status(400).json({ message: 'OTP expired' });

    user.otp = null; // Clear OTP after successful verification
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id.toString(), mobile: user.mobile },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '1h' }
    );
    
    
    res.json({ message: 'OTP verified successfully' ,token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};