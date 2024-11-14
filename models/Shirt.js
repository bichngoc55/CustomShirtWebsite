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
      type: [String],
      enum: ["black", "white"],
      required: true,
    },
    isSale: {
      type: Boolean,
      default: false,
    },
    salePercent: {
      type: Number,
      default: 0,
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
      type: [String],
    },
    quantity: {
      type: Number,
      default: 0,
    },
    reviews: {
      reviewCustomerID: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      stars: {
        type: Number,
        default: 5,
      },
      reviewImage: {
        type: [String],
      },
      comment: {
        type: String,
      },
    },
  },
  { timestamps: true }
);
const Shirt = mongoose.model("Shirt", ShirtSchema);

module.exports = Shirt;
