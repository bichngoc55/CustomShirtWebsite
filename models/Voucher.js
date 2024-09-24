const mongoose = require("mongoose");
const { Schema } = mongoose;
const voucherSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    imageUrl: {
      type: String,
      default: "",
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
  },
  { timestamps: true }
);
const Voucher = mongoose.model("Voucher", voucherSchema);
module.exports = Voucher;
