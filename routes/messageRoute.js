const express = require("express");
const router = express.Router();
const {
  sendMessage,
  unsendMessage,
  getConversation,
} = require("../controllers/messageController");
const verifyToken = require("../middleware/authMiddleware.js");

router.post("/send/:userId", sendMessage);
router.put("/unsend/:messageId", unsendMessage);
router.get("/conversation/:id", getConversation);

module.exports = router;
