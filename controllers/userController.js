const User = require("../models/User.js");
const mongoose = require("mongoose");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "customer" });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDetailUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// const addRecentViewdProduct = async (req, res) => {
//   try {
//     const { userId, productId } = req.body;
//     console.log("user id, product id:", userId, productId);

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (!user.recentViewedShirts) {
//       user.recentViewedShirts = [];
//     }

//     if (
//       user.recentViewedShirts.some(
//         (item) => item.shirtId.toString() === productId
//       )
//     ) {
//       return res
//         .status(200)
//         .json({ message: "Product already in recent viewed products" });
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { $push: { recentViewedShirts: { shirtId: productId } } },
//       { new: true }
//     );

//     res.status(200).json(updatedUser);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const addRecentViewdProduct = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Input validation
    if (!userId || !productId) {
      return res.status(400).json({
        message: "Missing required fields: userId and productId are required",
      });
    }

    // Validate ObjectId format
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({
        message: "Invalid userId or productId format",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize recentViewedShirts if undefined
    if (!user.recentViewedShirts) {
      user.recentViewedShirts = [];
    }

    // Remove existing entry if present
    user.recentViewedShirts = user.recentViewedShirts.filter(
      (item) => item.shirtId.toString() !== productId.toString()
    );

    // Add new entry at the beginning
    user.recentViewedShirts.unshift({ shirtId: productId });

    // Limit to 4 items
    user.recentViewedShirts = user.recentViewedShirts.slice(0, 4);

    // Save with error handling
    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error in addRecentViewedProduct:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getRecentViewdProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // const user = await User.findById(userId);
    const user = await User.findById(id)
      .populate("recentViewedShirts.shirtId")
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.recentViewedShirts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const addUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json({ message: "user deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getAllUsers,
  getDetailUser,
  updateUser,
  addUser,
  deleteUser,
  addRecentViewdProduct,
  getRecentViewdProduct,
};
