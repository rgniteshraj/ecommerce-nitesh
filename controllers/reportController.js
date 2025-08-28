import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const buildDateFilter = (from, to) => {
  if (from && to) return { createdAt: { $gte: new Date(from), $lte: new Date(to) } };
  if (from) return { createdAt: { $gte: new Date(from) } };
  if (to) return { createdAt: { $lte: new Date(to) } };
  return {};
};

export const getSalesRange = async (req, res) => {
  await generateSalesReport(req, res, 'range');
};

export const getSalesFrom = async (req, res) => {
  await generateSalesReport(req, res, 'from');
};

export const getSalesTo = async (req, res) => {
  await generateSalesReport(req, res, 'to');
};

//Sales Reports (Daily, Monthly, Yearly)
const generateSalesReport = async (req, res, type) => {
  try {
    const { period } = req.query; // daily, monthly, yearly
    const { from, to } = req.query;
    let groupId = {};

    if (period === 'daily') {
      groupId = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
    } else if (period === 'monthly') {
      groupId = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
    } else if (period === 'yearly') {
      groupId = { year: { $year: "$createdAt" } };
    } else {
      return res.status(400).json({ message: "Invalid period (daily, monthly, yearly)" });
    }

    let dateFilter = {};
    if (type === 'range') dateFilter = buildDateFilter(from, to);
    if (type === 'from') dateFilter = buildDateFilter(from, null);
    if (type === 'to') dateFilter = buildDateFilter(null, to);

    const sales = await Cart.aggregate([
      { $match: dateFilter },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: groupId,
          totalSales: { $sum: { $multiply: ["$items.quantity", "$productDetails.price"] } },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Top Selling Products
export const getTopProductsRange = async (req, res) => {
  await generateTopProducts(req, res, 'range');
};

export const getTopProductsFrom = async (req, res) => {
  await generateTopProducts(req, res, 'from');
};

export const getTopProductsTo = async (req, res) => {
  await generateTopProducts(req, res, 'to');
};

const generateTopProducts = async (req, res, type) => {
  try {
    const { from, to } = req.query;
    let dateFilter = {};
    if (type === 'range') dateFilter = buildDateFilter(from, to);
    if (type === 'from') dateFilter = buildDateFilter(from, null);
    if (type === 'to') dateFilter = buildDateFilter(null, to);

    const products = await Cart.aggregate([
      { $match: dateFilter },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" }
    ]);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Inventory Alerts
export const getInventoryAlerts = async (req, res) => {
  try {
    const lowStock = await Product.find({ "variants.stock": { $lt: 5 } });
    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};