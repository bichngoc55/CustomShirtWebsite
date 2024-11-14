const OrderDetails = require("../models/OrderDetails.js");
const getAllOrderDetails = async (req, res) => {
  try {
    const orderDetails = await OrderDetails.find()
      .populate("design")
      .populate("product");
    res.status(200).json(orderDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order details by ID
const getDetailOrderByID = async (req, res) => {
  try {
    const orderDetail = await OrderDetails.findById(req.params.id)
      .populate("design")
      .populate("product");
    if (!orderDetail) {
      return res.status(404).json({ message: "Order detail not found" });
    }
    res.status(200).json(orderDetail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an Order Details
const updateOrderDetails = async (req, res) => {
  try {
    const orderDetail = await OrderDetails.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!orderDetail) {
      return res.status(404).json({ message: "Order detail not found" });
    }
    res.status(200).json(orderDetail);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add a new Order Details
const addOrderDetails = async (req, res) => {
  try {
    console.log(req.body);
    const newOrderDetail = new OrderDetails(req.body);
    await newOrderDetail.save();
    res.status(201).json(newOrderDetail);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an Order Details
const deleteOrderDetails = async (req, res) => {
  try {
    const orderDetail = await OrderDetails.findByIdAndDelete(req.params.id);
    if (!orderDetail) {
      return res.status(404).json({ message: "Order detail not found" });
    }
    res.status(200).json({ message: "Order detail deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllOrderDetails,
  getDetailOrderByID,
  updateOrderDetails,
  addOrderDetails,
  deleteOrderDetails,
};
