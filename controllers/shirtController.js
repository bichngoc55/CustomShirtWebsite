const Shirts = require("../models/Shirt.js");
// Get all shirts
const getAllShirts = async (req, res) => {
  try {
    const shirts = await Shirts.find();
    res.status(200).json(shirts);
  } catch (error) {
    res.status(500).json({ error: "Failed to get shirts" });
  }
};

// Get shirt details
const getDetailShirt = async (req, res) => {
  try {
    const shirt = await Shirts.findById(req.params.id);
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
    const { id } = req.body;
    const shirt = await Shirts.findByIdAndDelete(id);
    if (!shirt) {
      return res.status(404).json({ error: "shirt not found" });
    }
    res.status(200).json({ message: "shirt deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete shirt" });
  }
};

module.exports = {
  getAllShirts,
  getDetailShirt,
  updateShirt,
  addShirt,
  deleteShirt,
};
