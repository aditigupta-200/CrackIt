import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interview",
    required: true,
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["applied", "selected_for_interview", "hired", "rejected"],
    default: "applied",
  },
  appliedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Application", applicationSchema);
