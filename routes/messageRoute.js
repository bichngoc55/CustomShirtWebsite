const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const verifyToken = require("../middleware/authMiddleware.js");

router.post("/send", verifyToken, messageController.sendMessage);
router.post("/unsend/:messageId", verifyToken, messageController.unsendMessage);
router.get(
  "/conversation/:userId",
  verifyToken,
  messageController.getConversation
);

module.exports = router;
