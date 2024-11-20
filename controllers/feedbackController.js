const Feedback = require("../models/Feedback");
const Order = require("../models/Order.js");

// Create new feedback
const createFeedback = async (req, res) => {
  try {
    const { feedbackCustomerID, customerEmail, feedbackContent, feedbackStar } =
      req.body;
    const order = await Order.findOne({
      "userInfo.userId": feedbackCustomerID,
      deliveryStatus: "delivered",
    });

    if (!order) {
      return res.status(403).json({
        message: "You have to buy the product before leaving a feedback.",
      });
    }
    const newFeedback = new Feedback({
      feedbackCustomerID,
      customerEmail,
      feedbackContent,
      feedbackStar,
    });

    const savedFeedback = await newFeedback.save();
    res.status(201).json(savedFeedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all feedbacks with optional star filter
const getAllFeedbacks = async (req, res) => {
  try {
    const { starFilter } = req.query;
    let query = {};

    if (starFilter) {
      query.feedbackStar = parseInt(starFilter);
    }

    const feedbacks = await Feedback.find(query)
      .populate("feedbackCustomerID")
      .sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get feedback by customerID
const getFeedbacksByCustomerId = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      feedbackCustomerID: req.params.customerID,
    }).populate("feedbackCustomerID");

    if (!feedbacks.length) {
      return res
        .status(404)
        .json({ message: "No feedbacks found for this customer" });
    }
    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update feedback
const updateFeedback = async (req, res) => {
  try {
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          feedbackContent: req.body.feedbackContent,
          feedbackStar: req.body.feedbackStar,
        },
      },
      { new: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.status(200).json(updatedFeedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete feedback
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get feedback statistics
const getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$feedbackStar" },
          totalFeedbacks: { $sum: 1 },
          ratingDistribution: { $push: "$feedbackStar" },
        },
      },
      {
        $project: {
          _id: 0,
          averageRating: { $round: ["$averageRating", 1] },
          totalFeedbacks: 1,
          ratingDistribution: {
            1: {
              $size: {
                $filter: {
                  input: "$ratingDistribution",
                  cond: { $eq: ["$$this", 1] },
                },
              },
            },
            2: {
              $size: {
                $filter: {
                  input: "$ratingDistribution",
                  cond: { $eq: ["$$this", 2] },
                },
              },
            },
            3: {
              $size: {
                $filter: {
                  input: "$ratingDistribution",
                  cond: { $eq: ["$$this", 3] },
                },
              },
            },
            4: {
              $size: {
                $filter: {
                  input: "$ratingDistribution",
                  cond: { $eq: ["$$this", 4] },
                },
              },
            },
            5: {
              $size: {
                $filter: {
                  input: "$ratingDistribution",
                  cond: { $eq: ["$$this", 5] },
                },
              },
            },
          },
        },
      },
    ]);

    res.status(200).json(
      stats[0] || {
        averageRating: 0,
        totalFeedbacks: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get recent feedbacks with pagination
const getRecentFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments();

    res.status(200).json({
      feedbacks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalFeedbacks: total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createFeedback,
  getAllFeedbacks,
  getFeedbacksByCustomerId,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats,
  getRecentFeedbacks,
};
