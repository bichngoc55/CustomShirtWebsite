const Bill = require("../models/Order.js");
// Get all orders
const getAllBills = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = {};
    if (startDate && endDate) {
      filter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const orders = await Bill.find(filter);
    const count = await Bill.countDocuments(filter);

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to get orders" });
  }
};

// Get order details
const getDetailBills = async (req, res) => {
  try {
    if (req.params.id === "undefined") return;
    const order = await Bill.findById(req.params.id)
      .populate("items.product")
      .populate("voucherId");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
    // console.log(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get order details" });
  }
};
// Create a new order
const createBill = async (req, res) => {
  try {
    const newBill = new Bill(req.body);
    await newBill.save();
    res.status(201).json(newBill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// Delete an order
const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }
    res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete bill" });
  }
};
const updateBill = async (req, res) => {
  try {
    const update = req.body;
    const bill = await Bill.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }
    res.status(200).json(bill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update bill" });
  }
};
module.exports = {
  getAllBills,
  getDetailBills,
  createBill,
  deleteBill,
  updateBill,
};
