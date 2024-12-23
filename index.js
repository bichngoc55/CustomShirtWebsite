const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const ngrok = require("ngrok");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoute.js");
const cron = require("node-cron");
const billRoutes = require("./routes/billRoute.js");
const userRoutes = require("./routes/userRoute.js");
const cartRoutes = require("./routes/cartRoute.js");
const voucherRoutes = require("./routes/voucherRoute.js");
const messageRoutes = require("./routes/messageRoute.js");
const orderRoutes = require("./routes/orderRoute.js");
const orderDetailsRoutes = require("./routes/orderDetailsRoutes.js");
const feedbackRoutes = require("./routes/feedbackRoute.js");
const TitanImageService = require("./utils/model.js");
const designRoutes = require("./routes/designRoute.js");
const vnpayRoutes = require("./routes/vnpayRoutes");

// const { createHelia } = require("helia");
// const { unixfs } = require("@helia/unixfs");
// const { createLibp2p } = require("libp2p");
// const { dagJson } = require("@helia/json");
// const { FsBlockstore } = require("blockstore-fs");
// const Web3 = require("web3");
const shirtRoutes = require("./routes/shirtRoute.js");
//config
dotenv.config();
//express app
const app = express();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
//use
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
(async function () {
  try {
    const url = await ngrok.connect({
      proto: "http",
      addr: 3005,
      region: "us",
      authtoken: process.env.NGROK_AUTH,
    });
    console.log(`Ngrok tunnel created: ${url}`);
    process.env.NGROK_URL = url;
  } catch (error) {
    console.error("Ngrok Error:", error);
  }
})();
app.use(cors());
app.use(morgan("common"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
// app.use(express.static("public"));
app.use(cookieParser());

app.use(cors());
//express
app.use("/auth", authRoutes);
app.use("/bill", billRoutes);
app.use("/user", userRoutes);
app.use("/shirt", shirtRoutes);
app.use("/cart", cartRoutes);
app.use("/message", messageRoutes);
app.use("/voucher", voucherRoutes);
app.use("/orderDetails", orderDetailsRoutes);
app.use("/order", orderRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/design", designRoutes);
app.use("/vnpay", vnpayRoutes);

app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;

  try {
    const result = await TitanImageService.generateImage(prompt);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Image generation failed",
    });
  }
});

//connect to mongodb
mongoose
  .connect(process.env.URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error: ", error.message);
  });
//  // Initialize Helia with IPFS
// async function createHeliaNode() {
//   const blockstore = new FsBlockstore('./blocks');
//   const libp2p = await createLibp2p();

//   const helia = await createHelia({
//     libp2p,
//     blockstore
//   });

//   const fs = unixfs(helia);
//   const json = dagJson(helia);

//   return { helia, fs, json };
// }
// let heliaNode;
// (async () => {
//   try {
//     heliaNode = await createHeliaNode();
//     console.log('Helia node is ready');
//   } catch (error) {
//     console.error('Failed to create Helia node:', error);
//   }
// })();

// connect to infura
// const web3 = new Web3(
//   new Web3.providers.HttpProvider(
//     `https://polygon-amoy.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
//   )
// );
// Helper function to convert Buffer to AsyncIterable
// async function* bufferToAsyncIterable(buffer) {
//   yield buffer;
// }
// Import contract ABI and address
// const TShirtNFT = require('./build/contracts/TShirtNFT.json');
// const contractAddress = process.env.CONTRACT_ADDRESS;
// const nftContract = new web3.eth.Contract(TShirtNFT.abi, contractAddress);
// Upload design to IPFS using Helia
// app.post("/api/upload-design", upload.single("design"), async (req, res) => {
//   try {
//     if (!heliaNode) {
//       throw new Error("Helia node not initialized");
//     }

//     const { fs, json } = heliaNode;
//     const file = req.file;

//     // Upload the file to IPFS
//     const fileStream = bufferToAsyncIterable(file.buffer);
//     const fileCid = await fs.addFile(fileStream);

//     // Create and upload metadata
//     const metadata = {
//       name: `Custom T-Shirt Design #${Date.now()}`,
//       description: req.body.description || "Custom T-Shirt Design",
//       image: `ipfs://${fileCid.toString()}`,
//       attributes: [
//         {
//           trait_type: "Designer",
//           value: req.body.designer,
//         },
//         {
//           trait_type: "Creation Date",
//           value: new Date().toISOString(),
//         },
//       ],
//     };
//     // Add metadata to IPFS
//     const metadataCid = await json.add(metadata);

//     res.json({
//       success: true,
//       fileCid: fileCid.toString(),
//       metadataUri: `ipfs://${metadataCid.toString()}`,
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// //  get user nft data
// app.get("/balances", async (req, res) => {
//   try {
//     const { address } = req.query;
//     const nativeBalance = await Moralis.EvmApi.balance.getNativeBalance({
//       address,
//       chain,
//     });
//     const tokens = await Moralis.EvmApi.token.getWalletTokenBalances({
//       address,
//       chain,
//     });
//     const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
//       address,
//       chain,
//       limit: 10,
//     });
//     res.json({ native: nativeBalance.result.balance.ether, tokens, nfts });
//   } catch (error) {
//     res.status(500).send("Error fetching balances");
//   }
// });
// mint
// app.post("/mint-nft", async (req, res) => {
//   try {
//     const { recipientAddress, tokenURI } = req.body;

//     // Example Moralis method to call a mint function on your contract
//     const mintTx = await Moralis.EvmApi.nft.runContractFunction({
//       chain,
//       address: contractAddress,
//       function_name: "mintNFT",
//       params: {
//         recipient: recipientAddress,
//         tokenURI,
//       },
//       abi: YOUR_CONTRACT_ABI, // Contract ABI
//     });

//     res.status(200).json({ message: "NFT minted successfully!", data: mintTx });
//   } catch (error) {
//     console.error("Minting error:", error);
//     res.status(500).json({ error: "NFT minting failed" });
//   }
// });
// app.post("/api/mint-nft", async (req, res) => {
//   const { userAddress, tokenURI } = req.body;

//   if (!userAddress || !tokenURI) {
//     return res.status(400).json({ error: "Missing required parameters." });
//   }

//   try {
//     // Call mintNFT function with the customer’s MetaMask address and metadata URI
//     const tx = await nftContract.methods
//       .mintNFT(userAddress, tokenURI)
//       .send({ from: userAddress });
//     res.json({ success: true, transaction: tx });
//   } catch (error) {
//     console.error("Minting failed:", error);
//     res.status(500).json({ error: "Failed to mint NFT." });
//   }
// });
// startMoralis();

//listener
app.listen(process.env.PORT, () => {
  console.log("Server is running on port ", process.env.PORT);
});
