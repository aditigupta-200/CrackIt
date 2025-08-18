//Submission.js
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
  language: { type: String, required: true }, // e.g., 'javascript', 'python', 'java'
  status: { type: String, required: true }, // e.g., 'Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded'
  stdout: { type: String }, // Standard output
  stderr: { type: String }, // Standard error
  time: { type: String }, // Execution time from Judge0
  memory: { type: String }, // Memory used from Judge0
  runtime: { type: Number }, // Runtime in milliseconds for analytics
  memoryUsage: { type: Number }, // Memory in KB for analytics
  createdAt: { type: Date, default: Date.now },
  testCasesPassed: { type: Number, required: true },
  testCasesFailed: { type: Number, required: true },
  pointsEarned: { type: Number, default: 0 },
  // Additional fields for Judge0 integration
  judge0Token: { type: String }, // Token from Judge0 for tracking
  testCaseResults: [
    {
      input: String,
      expectedOutput: String,
      actualOutput: String,
      status: String, // 'Passed', 'Failed', 'Error'
      runtime: Number,
      memory: Number,
    },
  ],
});

export default mongoose.model("Submission", submissionSchema);
