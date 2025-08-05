import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema({
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interview",
    required: true,
  },
  questionText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("InterviewQuestion", interviewQuestionSchema);
