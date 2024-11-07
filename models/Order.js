const mongoose = require("mongoose");
const OrderDetails = require("./OrderDetails");
const { Schema } = mongoose;

const OrderSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrderDetails",
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
    shippingMethod: {
      type: String,
      enum: ["standard", "budget", "fast"],
      required: true,
    },
    paymentDetails: {
      method: {
        type: String,
        enum: ["Cash", "Digital", "Credit_Card"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        required: true,
      },
      cardExpirationDate: {
        type: Date,
      },
      transactionId: String,
      last4Digits: String,
      cardBrand: {
        type: String,
        enum: ["Visa", "Paypal"],
      },
      paidAt: Date,
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    note: String,
  },
  {
    timestamps: true,
  }
);

const Orders = mongoose.model("Orders", OrderSchema);

module.exports = Orders;
