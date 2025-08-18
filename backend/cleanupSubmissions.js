import mongoose from "mongoose";
import Submission from "./src/models/Submission.js";
import DSAQuestion from "./src/models/DSAQuestion.js";
import { config } from "dotenv";

config();

const cleanupOrphanedSubmissions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all submissions
    const allSubmissions = await Submission.find({});
    console.log(`Found ${allSubmissions.length} submissions`);

    // Get all valid question IDs
    const validQuestionIds = await DSAQuestion.find({}).distinct("_id");
    console.log(`Found ${validQuestionIds.length} valid questions`);

    // Find orphaned submissions
    const orphanedSubmissions = allSubmissions.filter(
      (submission) =>
        !validQuestionIds.some(
          (id) => id.toString() === submission.question.toString()
        )
    );

    console.log(`Found ${orphanedSubmissions.length} orphaned submissions`);

    if (orphanedSubmissions.length > 0) {
      // Delete orphaned submissions
      const orphanedIds = orphanedSubmissions.map((s) => s._id);
      const deleteResult = await Submission.deleteMany({
        _id: { $in: orphanedIds },
      });
      console.log(
        `✅ Deleted ${deleteResult.deletedCount} orphaned submissions`
      );
    } else {
      console.log("✅ No orphaned submissions found");
    }

    console.log("🎉 Cleanup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
};

cleanupOrphanedSubmissions();
