import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'reviews', // folder name in Cloudinary
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

const upload = multer({ storage });


export default upload;
