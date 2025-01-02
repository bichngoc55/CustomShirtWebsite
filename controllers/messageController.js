const Message = require("../models/Message.js");
const mongoose = require("mongoose");

const ADMIN_ID="6716e91039ea3d3dc8d3f65f"

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, image } = req.body;
    console.log(receiverId, " ", content, " ", image);
    const { userId } = req.params;

    const newMessage = new Message({
      sender: userId,
      receiver: receiverId,
      content: content || "",
      image: image || null,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminSendMessage = async (req, res) => {
  try {
    const { receiverId, content, image } = req.body;
    console.log("HEHEHHEHE");
    
    
    const newMessage = new Message({
      sender: ADMIN_ID,
      receiver: receiverId,
      content: content || "",
      image: image || null,
    });
    console.log("HEHEHHEHE");

    
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unsendMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    console.log(messageId);

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        $set: {
          content: "This message was unsent",
          isUnsent: true,
        },
      },
      { new: true }
    );

    res.json(updatedMessage);
  } catch (error) {
    console.error("Error in unsendMessage:", error);
    res.status(500).json({ error: error.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = "6716e91039ea3d3dc8d3f65f";

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const senderId = new mongoose.Types.ObjectId(id);
    const receiverId = new mongoose.Types.ObjectId(userId);

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean()
      .exec();
    // const messages = await Message.findAll()

    const transformedMessages = messages.map((message) => ({
      ...message,
      status: message.isUnsent ? "unsent" : "sent",
    }));

    res.json(transformedMessages);
  } catch (error) {
    console.error("Error in getConversation:", error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  sendMessage,
  getConversation,
  adminSendMessage,
  unsendMessage,
  
};
