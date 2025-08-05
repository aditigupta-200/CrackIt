import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DSAQuestion",
    required: true,
  }, // DSA Question ID
  interviewQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewQuestion",
  }, // Optional for interviews
  code: { type: String, required: true },
  language: { type: String, required: true }, // e.g., 'javascript', 'python'
  status: { type: String, required: true }, // e.g., 'Accepted', 'Wrong Answer'
  stdout: { type: String }, // Standard output
  stderr: { type: String }, // Standard error
  time: { type: String }, // Execution time
  memory: { type: String }, // Memory used
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Submission", submissionSchema);
