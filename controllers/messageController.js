const Message = require("../models/Message.js");

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const unsendMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    if (message.sender.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to unsend this message" });
    }
    message.content = "This message was unsent";
    message.isUnsent = true;
    await message.save();

    res.json({ message: "Message unsent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username role")
      .populate("receiver", "username role");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  sendMessage,
  getConversation,
  unsendMessage,
};
