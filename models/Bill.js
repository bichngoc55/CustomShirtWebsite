const mongoose = require("mongoose");
const { Schema } = mongoose;

const billSchema = new Schema(
  {
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        size: {
          type: String,
          enum: ["S", "M", "L", ""],
        },
        color: {
          type: String,
          enum: ["black", "white"],
        },
      },
    ],
    voucherId: {
      type: Schema.Types.ObjectId,
      ref: "Voucher",
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Bill = mongoose.model("Bill", billSchema);

module.exports = Bill;
