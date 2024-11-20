const express = require("express");
const router = express.Router();
const {
  createVoucher,
  getVouchers,
  getVoucherStats,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  validateVoucher,
} = require("../controllers/voucherController");

// CRUD routes
router.post("/", createVoucher);
router.get("/", getVouchers);
router.get("/stats", getVoucherStats);
router.get("/:id", getVoucherById);
router.patch("/:id", updateVoucher);
router.delete("/:id", deleteVoucher);

// Additional routes
router.get("/validate/:code", validateVoucher);

module.exports = router;
