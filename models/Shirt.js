const mongoose = require("mongoose");
const { Schema } = mongoose;

const ShirtSchema = new Schema(
  {
    shirtId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    size: {
      enum: ["S", "M", "L", "XL", "XXL"],
    },
    color: {
      enum: ["black", "white"],
    },
    isSale: {
      type: Boolean,
    },
    isNew: {
      type: Boolean,
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
      required: true,
    },
    reviews: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
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
