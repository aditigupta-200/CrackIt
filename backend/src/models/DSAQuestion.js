import mongoose from "mongoose";

const dsaQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  tags: [{ type: String }], // e.g., ['Array', 'DP']
  boilerplates: {
    type: Map,
    of: String,
    default: {
      java: `class Solution {
    public int solve() {
        // USER_CODE_HERE
    }
}`,
      python: `class Solution:
    def solve(self):
        # USER_CODE_HERE
`,
      javascript: `/**
 * @return {number}
 */
var solve = function() {
    // USER_CODE_HERE
};`,
    },
  }, // Key: language, Value: boilerplate code
  testCases: [
    {
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true },
      isHidden: { type: Boolean, default: true }, // Sample vs hidden test cases
    },
  ],
  constraints: { type: String }, // e.g., "1 <= n <= 10^5"
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("DSAQuestion", dsaQuestionSchema);
