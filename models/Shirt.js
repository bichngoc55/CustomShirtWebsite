const mongoose = require("mongoose");
const { Schema } = mongoose;

const ShirtSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: [String],
      enum: ["S", "M", "L", "XL", "XXL"],
      required: true,
    },
    color: {
      type: String,
      enum: ["black", "white"],
      required: true,
    },
    isSale: {
      type: Boolean,
      default: false,
    },
    isNewShirt: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    reviews: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      stars: {
        type: Number,
        default: 5,
      },
      comment: {
        type: String,
        default: "Dinh noc kich tran bay phat phoi",
      },
    },
  },
  { timestamps: true }
);
const Shirt = mongoose.model("Shirt", ShirtSchema);

module.exports = Shirt;
