// const Cart = require("../models/Cart.js");
// const mongoose = require("mongoose");

// const getCart = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const cart = await Cart.findOne({ userId: id }).populate({
//       path: "items.product",
//       select: "name price imageUrl",
//     });
//     res.status(200).json(cart);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// const addToCart = async (req, res) => {
//   try {
//     const { userId, productId, selectedSize, selectedColor, quantity } =
//       req.body;
//     console.log(req.body);
//     let cart = await Cart.findOne({ userId });

//     if (!cart) {
//       cart = new Cart({ userId: userId, items: [] });
//     }

//     const existingItem = cart.items.find(
//       (item) =>
//         item.product === productId &&
//         item.selectedSize === selectedSize &&
//         item.selectedColor === selectedColor
//     );

//     if (existingItem) {
//       existingItem.quantity += quantity;
//     } else {
//       cart.items.push({
//         product: productId,
//         selectedSize,
//         selectedColor,
//         quantity,
//       });
//     }

//     await cart.save();
//     res.status(201).json(cart);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// const removeFromCart = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { productId, selectedColor, selectedSize } = req.body;
//     console.log("HEHE", productId, selectedColor, selectedSize);

//     // Validate inputs
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ message: "Invalid product ID" });
//     }
//     if (!selectedColor || !selectedSize) {
//       return res.status(400).json({ message: "Color and size are required" });
//     }
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ message: "Invalid product ID" });
//     }
//     const cart = await Cart.findOneAndUpdate(
//       { userId: id },
//       {
//         $pull: {
//           items: {
//             product: new mongoose.Types.ObjectId(productId),
//             selectedColor: selectedColor,
//             selectedSize: selectedSize,
//           },
//         },
//       },
//       { new: true }
//     );
//     console.log("cart inside remove function", cart);
//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }

//     res.status(200).json(cart);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// const clearCart = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const cart = await Cart.findOneAndUpdate(
//       { userId: id },
//       { items: [] },
//       { new: true }
//     );
//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }
//     res.status(200).json(cart);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };
// const decreaseCart = async () => {
//   try {
//     const { id } = req.params;
//     const { productId } = req.body;
//     const cart = await Cart.findOneAndUpdate(
//       { userId: id, "items.product": productId, "items.quantity": { $gt: 1 } },
//       { $inc: { "items.$.quantity": -1 } },
//       { new: true }
//     );
//     if (!cart) {
//       const cartAfterRemoval = await Cart.findOneAndUpdate(
//         { userId: id },
//         { $pull: { items: { product: productId } } },
//         { new: true }
//       );
//       if (!cartAfterRemoval)
//         return res
//           .status(404)
//           .json({ message: "Cart not found or item not found" });
//       return res.status(200).json(cartAfterRemoval);
//     }
//     res.status(200).json(cart);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };
// const incrementCart = async () => {
//   try {
//     const { id } = req.params;
//     const { productId } = req.body;

//     const cart = await Cart.findOneAndUpdate(
//       { userId: id, "items.product": productId },
//       { $inc: { "items.$.quantity": 1 } },
//       { new: true }
//     );

//     if (!cart) {
//       return res
//         .status(404)
//         .json({ message: "Cart not found or item not found" });
//     }
//     res.status(200).json(cart);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// module.exports = {
//   getCart,
//   addToCart,
//   removeFromCart,
//   clearCart,
//   decreaseCart,
//   incrementCart,
// };
const Cart = require("../models/Cart");

const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await Cart.findOne({ userId }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, selectedSize, selectedColor, quantity } = req.body;

    let cart = await Cart.findOne({ userId: userId });
    console.log("cart", cart);

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        selectedSize,
        selectedColor,
        quantity,
      });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    // Populate product details before sending response
    await cart.populate("items.product");
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    cart.updatedAt = Date.now();
    await cart.save();

    await cart.populate("items.product");
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((item) => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();

    await cart.populate("items.product");
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
};
