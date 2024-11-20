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
} = require("../controllers/orderController");
router.put("/delivery-status", updateDeliveryStatus);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.post("/add", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.put("/:id/cancel", cancelOrder);
router.put("/:id/status", updateOrderStatus);

module.exports = router;
