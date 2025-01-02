
const express = require("express");
const router = express.Router();
const { 
  getTotalOrdersStats,
  getLeastQuantityProducts,
  getTopProducts,
  getRevenueData
} = require("../controllers/statisController");

router.get("/total", getTotalOrdersStats);
router.get("/least-quantity", getLeastQuantityProducts);
router.get("/top", getTopProducts);
router.get("/revenue", getRevenueData);

module.exports = router;