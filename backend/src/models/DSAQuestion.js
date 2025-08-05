import mongoose from "mongoose";

const dsaQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  tags: [{ type: String }],
  testCases: [
    {
      input: { type: String },
      expectedOutput: { type: String },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});



export default mongoose.model("DSAQuestion", dsaQuestionSchema);
