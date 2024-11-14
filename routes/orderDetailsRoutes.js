const express = require("express");
const router = express.Router();
const {
  getAllOrderDetails,
  getDetailOrderByID,
  updateOrderDetails,
  addOrderDetails,
  deleteOrderDetails,
} = require("../controllers/orderDetailsController");

router.get("/", getAllOrderDetails);
router.get("/:id", getDetailOrderByID);
router.post("/add", addOrderDetails);
router.put("/:id", updateOrderDetails);
router.delete("/:id", deleteOrderDetails);

module.exports = router;
