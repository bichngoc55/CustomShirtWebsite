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
  },
  { timestamps: true }
);
const Voucher = mongoose.model("Voucher", voucherSchema);
module.exports = Voucher;
