const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateDeliveryStatus,
  cancelOrder,
  updateOrderStatus,
  getTopSellingShirts,
  autoRefuseUnconfirmedOrders,updateOrderShipping, 
} = require("../controllers/orderController");
const verifyToken = require("../middleware/authMiddleware.js");

router.put("/:id/cancel", cancelOrder);
router.put("/:id/status", updateOrderStatus);
router.put("/auto-refuse", autoRefuseUnconfirmedOrders);
router.put("/delivery-status", updateDeliveryStatus);
router.get("/", getAllOrders);
router.get("/top-selling", getTopSellingShirts);
router.get("/:id", getOrderById);

router.post("/add", createOrder);
router.patch("/:id", updateOrder);
router.patch("/shippingfee/:id",updateOrderShipping)

router.delete("/:id", deleteOrder); 

module.exports = router;
