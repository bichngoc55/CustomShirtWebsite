const mongoose = require("mongoose");

const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
