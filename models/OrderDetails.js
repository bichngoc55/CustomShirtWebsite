//dặt hàng đi má
const mongoose = require("mongoose");
const { Schema } = mongoose;

const OrderDetailsSchema = new Schema(
  {
    itemType: {
      type: String,
      enum: ["store", "custom"],
      required: true,
    },
    design: {
      type: Schema.Types.ObjectId,
      refPath: "Design",
    },
    product: {
      type: Schema.Types.ObjectId,
      refPath: "Shirt",
    },
    productSize: {
      type: [String],
      enum: ["S", "M", "L", "XL", "XXL"],
      required: true,
    },
    productColor: {
      type: [String],
      enum: ["black", "white"],
      required: true,
    },
    productQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

const OrderDetails = mongoose.model("Order", OrderDetailsSchema);
module.exports = { OrderDetails, OrderDetailsSchema };
