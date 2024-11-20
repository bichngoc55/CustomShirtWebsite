const Order = require("../models/Order.js");

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("items");

    for (const order of orders) {
      await order.populate("items.product");
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items")
      .populate("voucherId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new order
const createOrder = async (req, res) => {
  try {
    // const newOrder = await Order.create(req.body);
    console.log(req.body);

    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// for update delivery status automatically
const updateDeliveryStatus = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryStatus: { $ne: "cancelled" },
    });
    // console.log(orders);

    const currentDate = new Date();
    const updatedOrders = [];
    for (const order of orders) {
      if (order.deliveryDate < currentDate) {
        order.deliveryStatus = "delivered";
        await order.save();
        updatedOrders.push(order);
      }
    }
    // console.log("updated Orders", updatedOrders);

    res.status(200).json({
      message: "Delivery statuses updated successfully",
      updatedOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// for customer cancellation
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.deliveryStatus === "delivered") {
      return res.status(400).json({
        message: "Cannot cancel order that has already been delivered",
      });
    }

    order.deliveryStatus = "cancelled";
    // order.orderStatus = ""
    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// for admin confirmation
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["confirmed", "refused"].includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Status must be either 'confirmed' or 'refused'",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== "processing") {
      return res.status(400).json({
        message: "Can only update status for orders in processing state",
      });
    }

    order.orderStatus = status;

    if (status === "refused") {
      order.deliveryStatus = "cancelled";
    }
    await order.save();
    res.status(200).json({
      message: `Order ${status} successfully`,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const scheduledDeliveryStatusUpdate = async () => {
  try {
    const currentDate = new Date();

    const result = await Order.updateMany(
      {
        deliveryDate: { $lt: currentDate },
        deliveryStatus: "On delivery",
      },
      {
        $set: { deliveryStatus: "delivered" },
      }
    );

    console.log(`Updated ${result.modifiedCount} orders to delivered status`);
    return result;
  } catch (error) {
    console.error("Error in scheduled delivery status update:", error);
    throw error;
  }
};
module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateDeliveryStatus,
  cancelOrder,
  updateOrderStatus,
  scheduledDeliveryStatusUpdate,
};
