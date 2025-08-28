import express from 'express';
import { getSalesRange, getSalesFrom, getSalesTo, getTopProductsRange, getTopProductsFrom, getTopProductsTo, getInventoryAlerts } from '../controllers/reportController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// SALES
router.get('/sales/range', getSalesRange);
router.get('/sales/from', getSalesFrom);
router.get('/sales/to', getSalesTo);

// TOP PRODUCTS
router.get('/top-products/range', getTopProductsRange);
router.get('/top-products/from', getTopProductsFrom);

router.get('/top-products/to', getTopProductsTo);

//Inventory Alerts
router.get('/inventory', getInventoryAlerts);

export default router;