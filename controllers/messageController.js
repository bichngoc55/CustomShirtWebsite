const Message = require("../models/Message.js");
const mongoose = require("mongoose");

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    console.log(receiverId, content);
    const { userId } = req.params;
    // console.log(senderId);
    const newMessage = new Message({
      sender: userId,
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
    const { id } = req.params;
    const userId = "6716e91039ea3d3dc8d3f65f";
    console.log(id, userId);

    // Validate if the IDs are valid ObjectIds
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Convert string IDs to ObjectIds
    const senderId = new mongoose.Types.ObjectId(id);
    const receiverId = new mongoose.Types.ObjectId(userId);

    // Debug logging
    const allMessages = await Message.find({});
    console.log("All messages in database:", allMessages);
    console.log("Searching with params:", {
      senderId,
      receiverId,
    });

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ createdAt: 1 });
    // Uncomment these if you need to populate user details
    // .populate("sender", "username role")
    // .populate("receiver", "username role");

    res.json(messages);
  } catch (error) {
    console.error("Error in getConversation:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  unsendMessage,
};
