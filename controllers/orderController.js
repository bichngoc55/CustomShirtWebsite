const Order = require("../models/Order.js");
const { emailTemplates, transporter } = require("../utils/email.js");
const OrderDetails = require("../models/OrderDetails.js");

const sendOrderNotification = async (order, type) => {
  try {
    if (!order.userInfo || !order.userInfo.email) {
      throw new Error("Customer email not found");
    }

    const template = emailTemplates[type](order);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.userInfo.email,
      subject: template.subject,
      text: template.text,
    };

    await transporter.sendMail(mailOptions);
    // console.log(`Order notification email sent to ${order.userInfo.email}`);
  } catch (error) {
    console.error("Error sending order notification:", error);
    throw error;
  }
};
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "paymentDetails.status": { $ne: "failed" },
    }).populate({
      path: "items",
      populate: [
        {
          path: "design",
          model: "Design",
        },
        {
          path: "product",
          model: "Shirt",
        },
      ],
    });

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
const getOrdersByCustomerId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Customer ID is required" });
    }
    const orders = await Order.find({ "userInfo.userId": id })
      .populate("userInfo.userId", "name email phone")
      .populate("voucherId")
      .populate({
        path: "items",
        populate: [
          {
            path: "design",
            model: "Design",
          },
          {
            path: "product",
            model: "Shirt",
          },
        ],
      });

    // if (orders.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "No orders found for this customer" });
    // }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders by customerId:", error);
    res.status(500).json({
      message: "An error occurred while fetching orders",
      error: error.message,
    });
  }
};

// Create new order
const createOrder = async (req, res) => {
  try {
    console.log(req.body);
    // let { paymentDetails } = req.body;

    const newOrder = new Order(req.body);

    await sendOrderNotification(newOrder, "created");
    await newOrder.save();

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error.message);
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
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.items && order.items.length > 0) {
      await OrderDetails.deleteMany({ _id: { $in: order.items } });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Order and associated order details deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
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
        await sendOrderNotification(order, "delivered");
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
    await sendOrderNotification(order, "cancelled");

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
// const updateOrderStatus = async (req, res) => {
//   try {
//     const { status } = req.body;

//     if (!["confirmed", "refused"].includes(status)) {
//       return res.status(400).json({
//         message:
//           "Invalid status. Status must be either 'confirmed' or 'refused'",
//       });
//     }

//     const order = await Order.findById(req.params.id);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (order.orderStatus !== "processing") {
//       return res.status(400).json({
//         message: "Can only update status for orders in processing state",
//       });
//     }

//     order.orderStatus = status;

//     // if (status === "refused") {
//     //   order.deliveryStatus = "cancelled";
//     // }
//     if (status === "refused") {
//       order.deliveryStatus = "cancelled";
//       await sendOrderNotification(order, "cancelled");
//     } else {
//       order.deliveryStatus = "On delivery";
//       await sendOrderNotification(order, "confirmed");
//     }
//     await order.save();
//     res.status(200).json({
//       message: `Order ${status} successfully`,
//       order,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["confirmed", "refused"].includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Status must be either 'confirmed' or 'refused'",
      });
    }

    const order = await Order.findById(req.params.id).populate({
      path: "items",
      populate: {
        path: "product",
        model: "Shirt",
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== "processing") {
      return res.status(400).json({
        message: "Can only update status for orders in processing state",
      });
    }
    if (status === "confirmed") {
      for (const item of order.items) {
        const product = item.product;
        const orderedQuantity = item.productQuantity;

        if (product.quantity < orderedQuantity) {
          return res.status(400).json({
            message: `Insufficient stock for product ${product.name}. Available: ${product.quantity}, Ordered: ${orderedQuantity}`,
          });
        }
        await Shirt.findByIdAndUpdate(product._id, {
          $inc: { quantity: -orderedQuantity },
        });
      }
    }

    order.orderStatus = status;

    if (status === "refused") {
      order.deliveryStatus = "cancelled";
      await sendOrderNotification(order, "cancelled");
    } else {
      order.deliveryStatus = "On delivery";
      await sendOrderNotification(order, "confirmed");
    }

    await order.save();

    res.status(200).json({
      message: `Order ${status} successfully`,
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
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

    // console.log(`Updated ${result.modifiedCount} orders to delivered status`);
    return result;
  } catch (error) {
    console.error("Error in scheduled delivery status update:", error);
    throw error;
  }
};
const getTopSellingShirts = async (req, res) => {
  try {
    const topSellingShirts = await OrderDetails.aggregate([
      {
        $group: {
          _id: "$product",
          totalQuantitySold: { $sum: "$productQuantity" },
        },
      },
      {
        $sort: { totalQuantitySold: -1 },
      },
      {
        $limit: 4,
      },
      {
        $lookup: {
          from: "shirts",
          localField: "_id",
          foreignField: "_id",
          as: "shirtDetails",
        },
      },
      {
        $unwind: "$shirtDetails",
      },
      {
        $project: {
          _id: "$_id",
          name: "$shirtDetails.name",
          price: "$shirtDetails.price",
          totalQuantitySold: 1,
          isSale: "$shirtDetails.isSale",
          salePercent: "$shirtDetails.salePercent",
          imageUrl: "$shirtDetails.imageUrl",
          product: "$shirtDetails",
        },
      },
    ]);

    if (!topSellingShirts || topSellingShirts.length === 0) {
      return res.status(404).json({ message: "No top selling shirts found" });
    }

    res.status(200).json(topSellingShirts);
  } catch (error) {
    console.error("Error in getTopSellingShirts:", error);
    res.status(500).json({
      message: "Error fetching top selling shirts",
      error: error.message,
    });
  }
};
const autoRefuseUnconfirmedOrders = async (req, res) => {
  try {
    const currentDate = new Date();
    const unconfirmedOrders = await Order.find({
      orderStatus: "processing",
      deliveryDate: { $lt: currentDate },
    });

    // console.log("Unconfirmed", unconfirmedOrders);
    if (!unconfirmedOrders || unconfirmedOrders.length === 0) {
      return res.status(200).json({
        message: "No unconfirmed orders found within the deadline",

        count: 0,
      });
    }
    const updatedOrders = [];

    for (const order of unconfirmedOrders) {
      order.orderStatus = "refused";
      order.deliveryStatus = "cancelled";

      await sendOrderNotification(order, "refused");

      await order.save();
      updatedOrders.push(order);
    }

    res.status(200).json({
      message: "Unconfirmed orders automatically refused",
      updatedOrders,
      count: updatedOrders.length,
    });
  } catch (error) {
    console.error("Error in auto-refusing unconfirmed orders:", error);
    res.status(500).json({
      message: "Error auto-refusing unconfirmed orders",
      error: error.message,
    });
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
  getTopSellingShirts,
  autoRefuseUnconfirmedOrders,
  getOrdersByCustomerId,
};
