import express from 'express';
import { addAddress, updateAddress, deleteAddress, getAddresses } from '../controllers/addressController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getAddresses);
router.post('/', verifyToken, addAddress);
router.put('/:addressId', verifyToken, updateAddress);
router.delete('/:addressId', verifyToken, deleteAddress);

export default router;