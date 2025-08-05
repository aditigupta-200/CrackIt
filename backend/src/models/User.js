import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["candidate", "interviewer", "super_admin"],
    default: "candidate",
  },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserBadge" }],
  streak: {
    daily: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
  },
  questionsSolved: { type: Number, default: 0 },
  achievements: [{ type: String }], // e.g., offers, completed interviews
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
