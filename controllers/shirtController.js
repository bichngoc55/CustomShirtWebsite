const Shirts = require("../models/Shirt.js");
const Order = require("../models/Order.js");

// Get all shirts

const getAllShirts = async (req, res) => {
  try {
    const shirts = await Shirts.find().populate("reviews.reviewCustomerID");
    res.status(200).json(shirts);
  } catch (error) {
    res.status(500).json({ error: "Failed to get shirts" });
  }
};
// Get shirt details
const getDetailShirt = async (req, res) => {
  try {
    const shirt = await Shirts.findById(req.params.id).populate(
      "reviews.reviewCustomerID"
    );
    if (!shirt) {
      return res.status(404).json({ error: "Shirt not found" });
    }
    res.status(200).json(shirt);
  } catch (error) {
    res.status(500).json({ error: "Failed to get shirt details" });
  }
};

// Update a Shirt
const updateShirt = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = req.body;
    const shirt = await Shirts.findByIdAndUpdate(id, updatedProduct, {
      new: true,
    });
    if (!shirt) {
      return res.status(404).json({ error: "shirt not found" });
    }
    res.status(200).json(shirt);
  } catch (error) {
    res.status(500).json({ error: "Failed to update Shirt" });
  }
};
const updateShirtReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewCustomerID, stars, comment, reviewImage, productId } =
      req.body;
    // console.log("Update", id, reviewCustomerID, stars, comment);
    const order = await Order.findOne({
      "userInfo.userId": reviewCustomerID,
      items: { $in: [productId] },
      deliveryStatus: "delivered",
    });

    if (!order) {
      return res.status(403).json({
        message: "You have to buy the product before leaving a review.",
      });
    }

    const updatedShirt = await Shirts.findByIdAndUpdate(
      id,
      {
        $push: {
          reviews: {
            reviewCustomerID,
            stars,
            comment,
            reviewImage,
          },
        },
      },
      { new: true }
    ).populate("reviews.reviewCustomerID");

    if (!updatedShirt) {
      return res.status(404).json({ error: "Shirt not found" });
    }

    res.status(200).json(updatedShirt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Add a new Shirt
const addShirt = async (req, res) => {
  try {
    console.log("req.body : ", req.body);
    const shirt = new Shirts(req.body);
    await shirt.save();
    res.status(201).json(shirt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a Shirt
const deleteShirt = async (req, res) => {
  try {
    const { id } = req.params;
    const shirt = await Shirts.findByIdAndDelete(id);
    if (!shirt) {
      return res.status(404).json({ error: "shirt not found" });
    }
    res.status(200).json({ message: "shirt deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllShirts,
  getDetailShirt,
  updateShirt,
  addShirt,
  deleteShirt,
  updateShirtReview,
};
