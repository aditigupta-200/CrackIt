import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  requiredPoints: { type: Number, default: 0 },
  criteria: {
    type: {
      type: String,
      enum: ["difficulty", "streak", "total_problems", "points", "custom"],
      required: true,
    },
    value: { type: mongoose.Schema.Types.Mixed }, // Can be string (difficulty) or number (streak days, problem count)
    operator: {
      type: String,
      enum: ["equals", "greater_than", "greater_equal"],
      default: "greater_equal",
    },
  },
  icon: { type: String }, // Icon name or emoji
  color: { type: String, default: "#FFD700" }, // Badge color
  isActive: { type: Boolean, default: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Badge", badgeSchema);
