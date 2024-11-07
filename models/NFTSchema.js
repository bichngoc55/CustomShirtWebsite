const mongoose = require("mongoose");
const { Schema } = mongoose;

const NFTSchema = new Schema({
  tokenId: {
    type: String,
    unique: true,
    required: true,
  },
  contractAddress: {
    type: String,
    required: true,
  },
  blockchain: {
    type: String,
    enum: ["ethereum", "polygon", "solana"],
    default: "polygon",
  },
  mintedAt: {
    type: Date,
    default: Date.now,
  },
  mintTransactionHash: {
    type: String,
    required: true,
  },
  metadata: {
    name: String,
    description: String,
    image: String,
    attributes: [
      {
        trait_type: String,
        value: String,
      },
    ],
    externalUrl: String,
  },
  marketplaceUrl: String,
  price: {
    amount: Number,
    currency: {
      type: String,
      enum: ["ETH", "MATIC", "SOL", "USD"],
      default: "MATIC",
    },
  },
  status: {
    type: String,
    enum: ["minted", "listed", "sold", "transferred"],
    default: "minted",
  },
});
const NFT = mongoose.model("NFT", NFTSchema);
module.exports = NFT;
