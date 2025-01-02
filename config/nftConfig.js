// config/nftConfig.js
const { sepolia } = require("thirdweb/chains");

const NFT_CONFIG = {
  chainId: sepolia.chainId,
  contractAddress: process.env.NFT_CONTRACT_ADDRESS,
  chain: sepolia,
  // Add other testnet specific configurations
};

module.exports = NFT_CONFIG;
