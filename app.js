import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import reviewRoutes from './routes/reviewRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use('/api/products' , productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/auth' , userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});
export default app;
