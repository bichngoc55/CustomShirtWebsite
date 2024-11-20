const mongoose = require("mongoose");
const OrderDetails = require("./OrderDetails");
const { Schema } = mongoose;

const OrderSchema = new Schema(
  {
    userInfo: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrderDetails",
      },
    ],
    voucherId: {
      discount: {
        type: Number,
      },
      code: {
        type: String,
      },
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
      enum: ["standard", "express", "same day"],
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["processing", "confirmed", "refused"],
      default: "processing",
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
      province: String,
      district: String,
      details: String,
    },
    note: String,
    deliveryStatus: {
      type: String,
      enum: ["Pending", "On delivery", "delivered", "cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Orders = mongoose.model("Orders", OrderSchema);

module.exports = Orders;
