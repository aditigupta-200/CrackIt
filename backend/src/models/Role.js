import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["candidate", "interviewer", "super_admin"],
    required: true,
  },
  permissions: [{ type: String }], // e.g., ['createInterview', 'addDSAQuestion']
});

export default mongoose.model("Role", roleSchema);
