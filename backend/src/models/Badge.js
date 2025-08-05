import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  requiredPoints: { type: Number, required: true },
  criteria: { type: String }, // e.g., "Solve 50 DSA problems"
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Badge", badgeSchema);
