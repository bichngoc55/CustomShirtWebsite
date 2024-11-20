const mongoose = require("mongoose");
const { Schema } = mongoose;
const feedbackSchema = new Schema(
  {
    feedbackCustomerID: { type: Schema.Types.ObjectId, ref: "User" },
    customerEmail: { type: String },
    feedbackContent: { type: String, required: true },
    feedbackStar: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
