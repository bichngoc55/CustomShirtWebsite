const TShirtNFT = artifacts.require("TShirtNFT");

module.exports = function (deployer) {
  deployer.deploy(TShirtNFT);
};
