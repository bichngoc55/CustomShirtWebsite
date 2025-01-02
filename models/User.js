const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      max: 50,
    },
    name: {
      type: String,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    avaURL: {
      type: String,
      default: "",
    },
    SDT: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "customer",
    },
    status: {
      type: String,
      default: "active",
    },
    walletAddresses: [
      {
        blockchain: {
          type: String,
          enum: ["ethereum", "polygon", "sepolia"],
          required: true,
        },
        address: {
          type: String,
          required: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        label: String,
      },
    ],
    createdDesigns: [
      {
        type: Schema.Types.ObjectId,
        ref: "Design",
      },
    ],

    recentViewedShirts: [
      {
        shirtId: { type: Schema.Types.ObjectId, ref: "Shirt" },
      },
    ],
    messages: [
      {
        from: { type: Schema.Types.ObjectId, ref: "Message" },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
