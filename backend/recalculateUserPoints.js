import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./src/models/User.js";
import Submission from "./src/models/Submission.js";

dotenv.config();

const recalculateAllUserPoints = async () => {
  try {
    console.log("🔄 Starting user points recalculation...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get all users
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users to process`);

    let updatedUsers = 0;
    let totalCorrections = 0;

    for (const user of users) {
      console.log(`\n🔍 Processing user: ${user.username} (${user._id})`);

      // Get all accepted submissions for this user
      const submissions = await Submission.find({
        user: user._id,
        status: "Accepted",
      }).populate("question", "difficulty");

      // Filter valid submissions (with questions)
      const validSubmissions = submissions.filter(
        (submission) => submission.question
      );

      // Calculate unique questions and points
      const uniqueQuestions = new Set();
      const difficultyBreakdown = {
        easy: 0,
        medium: 0,
        hard: 0,
      };
      let recalculatedPoints = 0;

      validSubmissions.forEach((submission) => {
        const questionId = submission.question._id.toString();
        const difficulty = submission.question?.difficulty?.toLowerCase();

        // Only count each question once
        if (!uniqueQuestions.has(questionId)) {
          uniqueQuestions.add(questionId);

          if (difficultyBreakdown.hasOwnProperty(difficulty)) {
            difficultyBreakdown[difficulty]++;
          }

          // Calculate points based on difficulty
          switch (difficulty) {
            case "easy":
              recalculatedPoints += 5;
              break;
            case "medium":
              recalculatedPoints += 10;
              break;
            case "hard":
              recalculatedPoints += 20;
              break;
          }
        }
      });

      const recalculatedSolvedCount = uniqueQuestions.size;

      // Check if correction is needed
      if (
        user.points !== recalculatedPoints ||
        user.solvedQuestionsCount !== recalculatedSolvedCount ||
        user.mediumQuestionsSolved !== difficultyBreakdown.medium ||
        user.hardQuestionsSolved !== difficultyBreakdown.hard
      ) {
        console.log(`  🔧 Correction needed:`);
        console.log(`    Points: ${user.points} -> ${recalculatedPoints}`);
        console.log(
          `    Solved Questions: ${user.solvedQuestionsCount} -> ${recalculatedSolvedCount}`
        );
        console.log(
          `    Medium Solved: ${user.mediumQuestionsSolved} -> ${difficultyBreakdown.medium}`
        );
        console.log(
          `    Hard Solved: ${user.hardQuestionsSolved} -> ${difficultyBreakdown.hard}`
        );

        // Update the user
        await User.findByIdAndUpdate(user._id, {
          points: recalculatedPoints,
          solvedQuestionsCount: recalculatedSolvedCount,
          mediumQuestionsSolved: difficultyBreakdown.medium,
          hardQuestionsSolved: difficultyBreakdown.hard,
        });

        updatedUsers++;
        totalCorrections += Math.abs(user.points - recalculatedPoints);
        console.log(`  ✅ User updated successfully`);
      } else {
        console.log(`  ✅ User data already correct`);
      }
    }

    console.log(`\n🎉 Recalculation complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - Total users processed: ${users.length}`);
    console.log(`   - Users updated: ${updatedUsers}`);
    console.log(`   - Total points corrections: ${totalCorrections}`);
  } catch (error) {
    console.error("❌ Error during recalculation:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the recalculation
recalculateAllUserPoints();
