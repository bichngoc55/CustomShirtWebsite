const express = require("express");
const {
  login,
  register,
  resetPassword,
  requestPasswordReset,
} = require("../controllers/authController.js");

const router = express.Router();
//routes
router.post("/register", register);
router.post("/login", login);
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

module.exports = router;
