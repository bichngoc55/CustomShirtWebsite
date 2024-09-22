const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
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
    favoriteShirtNFTId: {
      type: String,
      min: 5,
      max: 70,
    },
    shirtNFTs: [
      {
        nftId: { type: String },
        name: { type: String },
        description: { type: String },
        imageUrl: { type: String },
      },
    ],
    savedDesign: [
      {
        designId: { type: Schema.Types.ObjectId, ref: "Design" },
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
