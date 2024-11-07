const mongoose = require("mongoose");
const { Schema } = mongoose;
const feedbackSchema = new Schema(
  {
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    feedbackContent: { type: String, required: true },
    feedbackStar: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
