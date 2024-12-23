const mongoose = require("mongoose");
const { Schema } = mongoose;
const voucherSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "used", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    conditions: {
      type: String,
      required: true,
    },
    isOneTime: {
      type: Boolean,
      default: false,
    },
    usedBy: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        orderId: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);
const Voucher = mongoose.model("Voucher", voucherSchema);
module.exports = Voucher;
