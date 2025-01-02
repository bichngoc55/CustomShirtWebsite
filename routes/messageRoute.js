const express = require("express");
const router = express.Router();
const {
  sendMessage,
  unsendMessage,adminSendMessage,
  getConversation,
} = require("../controllers/messageController");
const verifyToken = require("../middleware/authMiddleware.js");

router.post("/send/:userId", sendMessage);
router.put("/unsend/:messageId", unsendMessage);
router.get("/conversation/:id", getConversation);
router.post("/admin/send", adminSendMessage);
module.exports = router;
