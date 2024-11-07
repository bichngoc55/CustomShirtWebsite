const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateQuantity,
} = require("../controllers/cartController.js");
router.post("/:userId", addToCart);
router.get("/:userId", getCart);

router.delete("/:userId", clearCart);
router.patch("/:userId/items/:itemId", updateQuantity);
router.delete("/:userId/items/:itemId", removeFromCart);

module.exports = router;
