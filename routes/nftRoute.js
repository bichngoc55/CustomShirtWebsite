const express = require("express");
const router = express.Router();
const { mintNFT } = require("../controllers/nftController");
const verifyToken = require("../middleware/authMiddleware.js");

router.post("/mint", verifyToken, mintNFT);

module.exports = router;
