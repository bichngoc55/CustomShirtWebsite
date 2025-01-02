const NFT = require("../models/NFTSchema");
const Design = require("../models/Design");

const mintNFT = async (req, res) => {
  try {
    const { designId, nftData } = req.body;
    const { id } = req.user;

    const design = await Design.findOne({ _id: designId, id });
    if (!design) {
      return res.status(404).json({
        success: false,
        message: "Design not found or you don't have permission",
      });
    }

    const nft = new NFT({
      designId,
      tokenId: nftData.tokenId,
      contractAddress: nftData.contractAddress,
      blockchain: "sepolia",
      mintedBy: id,
      mintTransactionHash: nftData.mintTransactionHash,
      metadata: nftData.metadata,
      price: nftData.price,
      status: "minted",
    });

    await nft.save();

    design.nft = nft._id;
    await design.save();

    res.status(201).json({
      success: true,
      message: "NFT minted successfully",
      data: nft,
    });
  } catch (error) {
    console.error("NFT Minting Error:", error);
    res.status(500).json({
      success: false,
      message: "Error minting NFT",
      error: error.message,
    });
  }
};

module.exports = {
  mintNFT,
};
