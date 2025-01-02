const mongoose = require("mongoose");
const { Schema } = mongoose;

const DesignSchema = new Schema(
  {
    name: {
      type: String,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    color: {
      type: String,
      enum: ["black", "white"],
    },
    elements: [
      {
        type: {
          type: String,
          enum: ["text", "stickers", "shape"],
        },
        content: String,

        properties: {
          font: String,
          fontSize: Number,
          points: [
            {
              x: { type: Number },
              y: { type: Number },
            },
          ],
          color: String,
          position: {
            x: Number,
            y: Number,
          },
          rotation: Number,
          scale: Number,
          shapeType: String,
          width: Number,
          height: Number,
          src: String,
        },
      },
    ],
    previewImage: {
      type: String,
    },
    price: {
      type: Number,
    },
    isNFT: {
      type: Boolean,
      default: false,
    },
    nftDetails: {
      type: Schema.Types.ObjectId,
      ref: "NFTSchema",
    },
    mintingStatus: {
      type: String,
      enum: ["not_minted", "pending", "minted", "failed"],
      default: "not_minted",
    },
    cloudinaryImage: {
      type: String,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true }
);
const Design = mongoose.model("Design", DesignSchema);

module.exports = Design;
