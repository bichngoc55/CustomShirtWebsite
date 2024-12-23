const express = require("express");
const router = express.Router();
const vnpayController = require("../utils/VNPayUtils.js");

router.post("/create_payment_url", vnpayController.createPaymentUrl);

router.get("/vnpay_ipn", vnpayController.handleIPN);
// router.post("/vnpay_ipn", VNPayUtils.handleIPN);
router.post("/update-status", vnpayController.updatePaymentStatus);
router.get("/vnpay_return", vnpayController.handleReturn);

module.exports = router;
