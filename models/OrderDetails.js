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
      ref: "Design",
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Shirt",
    },
    productSize: {
      type: String,
      enum: ["S", "M", "L", "XL", "XXL"],
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productColor: {
      type: String,
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

const OrderDetails = mongoose.model("OrderDetails", OrderDetailsSchema);
module.exports = OrderDetails;
