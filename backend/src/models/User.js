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

  // Google Auth fields
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String },

  badges: [{ type: String }], // Badge names as strings
  streak: {
    daily: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
  },
  // Add these missing fields that are used in submission controller
  points: { type: Number, default: 0 },
  solvedQuestionsCount: { type: Number, default: 0 },
  mediumQuestionsSolved: { type: Number, default: 0 },
  hardQuestionsSolved: { type: Number, default: 0 },
  streakDays: { type: Number, default: 0 },
  lastSolvedDate: { type: String }, // Store as string for date comparison

  questionsSolved: { type: Number, default: 0 }, // Keep for backward compatibility
  achievements: [{ type: String }], // e.g., offers, completed interviews

  // Super Admin features
  restrictions: {
    canSubmitCode: { type: Boolean, default: true },
    canApplyForInterviews: { type: Boolean, default: true },
    canCreateInterviews: { type: Boolean, default: true },
    canViewBadges: { type: Boolean, default: true },
    restrictionReason: { type: String, default: "" },
  },
  restrictedAt: { type: Date },

  // Password reset fields
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },

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
