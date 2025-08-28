import  User from '../models/User.js'

export const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
     console.log("User ID from token:", userId);
    const { type, address, pincode, landmark } = req.body;

    if (!type || !address || !pincode) {
      return res.status(400).json({ message: 'Type, address, and pincode are required' });
    }

    const user = await User.findById(userId);
    console.log(user);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.addresses.push({ type, address, pincode, landmark });

    await user.save();

    res.status(201).json({ message: 'Address added successfully', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params; // ID of the specific address
    const { type, address, pincode, landmark } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const addressObj = user.addresses.id(addressId);
    if (!addressObj) return res.status(404).json({ message: 'Address not found' });

    if (type) addressObj.type = type;
    if (address) addressObj.address = address;
    if (pincode) addressObj.pincode = pincode;
    if (landmark) addressObj.landmark = landmark;

    await user.save();

    res.json({ message: 'Address updated successfully', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const addressObj = user.addresses.id(addressId);
    if (!addressObj) return res.status(404).json({ message: 'Address not found' });

    addressObj.deleteOne(); // removes the subdocument

    await user.save();

    res.json({ message: 'Address deleted successfully', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('addresses');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
