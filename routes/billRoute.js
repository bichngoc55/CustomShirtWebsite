const { verifyToken } = require("../middleware/authMiddleware.js");
const express = require("express");
const {
  getAllBills,
  getDetailBills,
  createBill,
  deleteBill,
  updateBill,
} = require("../controllers/billController.js");
const validateRequest = require("../validation/validateRequest.js");
const validateBill = require("../validation/orderValidation.js");

const router = express.Router();

/* READ */
router.get("/", getAllBills);

/* READ */
router.get("/:id", getDetailBills);
/* CREATE */
router.post("/add", createBill);
/* UPDATE */
router.patch("/:id", updateBill);

/* DELETE */
router.delete("/:id", deleteBill);
module.exports = router;
