const express = require("express");
const router = express.Router();
const {
  createFeedback,
  getAllFeedbacks,
  // getFeedbacksByCustomerId,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats,
  getRecentFeedbacks,
} = require("../controllers/feedbackController.js");
router.post("/", createFeedback);
router.get("/", getAllFeedbacks);
router.get("/feedbackStats", getFeedbackStats);

router.delete("/:id", deleteFeedback);
router.patch("/:id", updateFeedback);
router.get("/recent", getRecentFeedbacks);

module.exports = router;
