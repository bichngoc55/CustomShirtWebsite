const mongoose = require("mongoose");
const User = require("./User");
const { Schema } = mongoose;

// const messageSchema = new Schema(
//   {
//     senderId: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     content: {
//       type: String,
//       required: true,
//     },
//     timestamp: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { _id: false }
// );
// models/Message.js

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    isUnsent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
