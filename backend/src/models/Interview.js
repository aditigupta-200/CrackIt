import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  criteria: { type: String }, // e.g., "3+ years experience"
  scheduledTime: { type: Date, required: true },
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  videoSession: {
    link: { type: String },
    accessCode: { type: String },
  },
  candidatesApplied: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  selectedCandidate: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["upcoming", "completed"],
    default: "upcoming",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Interview", interviewSchema);
