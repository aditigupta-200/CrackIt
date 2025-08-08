import {
  createSubmission,
  getSubmissionResult,
} from "../services/judge0Service.js";
import Submission from "../models/Submission.js";
import DSAQuestion from "../models/DSAQuestion.js";
import { languages } from "../services/languages.js";
import User from "../models/User.js";
import Badge from "../models/Badge.js";

export const runCode = async (req, res) => {
  const { sourceCode, language, input, questionId } = req.body;

  try {
    console.log("🚀 Starting code execution...");
    console.log("📝 Request data:", {
      language,
      questionId,
      codeLength: sourceCode?.length,
    });

    // Validate required fields
    if (!sourceCode || !language || !questionId) {
      return res.status(400).json({
        message:
          "Missing required fields: sourceCode, language, and questionId are required",
      });
    }

    // Ensure question exists
    const question = await DSAQuestion.findById(questionId);
    if (!question) {
      console.log("❌ Question not found:", questionId);
      return res.status(404).json({ message: "DSA Question not found" });
    }
    console.log("✅ Question found:", question.title);

    // Get Judge0 language ID
    const languageId = languages[language];
    if (!languageId) {
      console.log("❌ Unsupported language:", language);
      return res.status(400).json({
        message: `Unsupported language: ${language}. Supported: ${Object.keys(
          languages
        ).join(", ")}`,
      });
    }
    console.log("✅ Language ID:", languageId);

    // Step 1: Send code to Judge0
    console.log("📤 Sending to Judge0...");
    const token = await createSubmission(sourceCode, languageId, input || "");
    console.log("✅ Judge0 token received:", token);

    // Step 2: Poll Judge0 until execution completes
    let result;
    let attempts = 0;
    const maxAttempts = 15; // 30 seconds max wait time

    do {
      attempts++;
      console.log(`⏳ Polling attempt ${attempts}/${maxAttempts}...`);

      if (attempts > 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 sec
      }

      result = await getSubmissionResult(token);
      console.log(
        "📊 Current status:",
        result.status.description,
        "(ID:",
        result.status.id + ")"
      );

      if (attempts >= maxAttempts) {
        console.log("⏰ Timeout reached");
        return res.status(408).json({
          message: "Code execution timeout. Please try again.",
        });
      }
    } while (result.status.id <= 2); // 1 = In Queue, 2 = Processing

    console.log("✅ Execution completed!");
    console.log("📊 Final result:", {
      status: result.status.description,
      stdout: result.stdout,
      stderr: result.stderr,
      time: result.time,
      memory: result.memory,
    });

    // Simulate test case results (replace with actual logic)
    const totalTestCases = question.testCases.length;
    const testCasesPassed = Math.floor(Math.random() * totalTestCases);
    const testCasesFailed = totalTestCases - testCasesPassed;

    // Step 3: Save submission
    const submission = await Submission.create({
      user: req.user._id,
      question: questionId,
      code: sourceCode,
      language,
      status: result.status.description,
      stdout: result.stdout,
      stderr: result.stderr,
      time: result.time,
      memory: result.memory,
      testCasesPassed,
      testCasesFailed,
    });
    console.log("💾 Submission saved:", submission._id);

    // Calculate points based on question difficulty
    let pointsEarned = 0;
    switch (question.difficulty) {
      case "easy":
        pointsEarned = 5;
        break;
      case "medium":
        pointsEarned = 10;
        break;
      case "hard":
        pointsEarned = 20;
        break;
      default:
        pointsEarned = 0;
    }

    // Update user stats and badges
    const user = await User.findById(req.user._id);
    user.points += pointsEarned;
    user.solvedQuestionsCount += 1;

    if (question.difficulty === "medium") {
      user.mediumQuestionsSolved += 1;
    } else if (question.difficulty === "hard") {
      user.hardQuestionsSolved += 1;
    }

    // Award badges for first solve by difficulty
    const badgesToAward = [];
    if (
      question.difficulty === "easy" &&
      !user.badges.includes("Easy Starter")
    ) {
      badgesToAward.push("Easy Starter");
    }

    if (
      question.difficulty === "medium" &&
      !user.badges.includes("Medium Challenger")
    ) {
      badgesToAward.push("Medium Challenger");
    }

    if (
      question.difficulty === "hard" &&
      !user.badges.includes("Hard Conqueror")
    ) {
      badgesToAward.push("Hard Conqueror");
    }

    // Update streak logic
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (user.lastSolvedDate === yesterday) {
      user.streakDays += 1;
    } else if (user.lastSolvedDate !== today) {
      user.streakDays = 1; // Reset streak
    }

    user.lastSolvedDate = today;

    // Award streak badges
    if (user.streakDays >= 7 && !user.badges.includes("7-Day Streak")) {
      user.badges.push("7-Day Streak");
    }

    if (user.streakDays >= 30 && !user.badges.includes("30-Day Streak")) {
      user.badges.push("30-Day Streak");
    }

    for (let badge of badgesToAward) {
      user.badges.push(badge);
    }

    await user.save();

    // Include pointsEarned and streak information in the response
    res.json({
      message: "Code executed successfully",
      result: {
        status: result.status.description,
        stdout: result.stdout,
        stderr: result.stderr,
        time: result.time,
        memory: result.memory,
      },
      submission: {
        _id: submission._id,
        user: submission.user,
        question: submission.question,
        code: submission.code,
        language: submission.language,
        status: submission.status,
        testCasesPassed: submission.testCasesPassed,
        testCasesFailed: submission.testCasesFailed,
        pointsEarned,
        streakDays: user.streakDays,
        createdAt: submission.createdAt,
      },
    });
  } catch (error) {
    // Enhanced error logging
    console.error("❌ Error in runCode:", error);
    console.error("❌ Error stack:", error.stack);

    // Handle different types of errors
    let errorMessage;
    if (typeof error.message === "object") {
      errorMessage = JSON.stringify(error.message);
    } else if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage = "An unexpected error occurred during code execution";
    }

    res.status(500).json({
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const submitCode = async (req, res) => {
  const { sourceCode, language, questionId } = req.body;

  try {
    // Validate required fields
    if (!sourceCode || !language || !questionId) {
      return res.status(400).json({
        message:
          "Missing required fields: sourceCode, language, and questionId are required",
      });
    }

    // Ensure question exists
    const question = await DSAQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "DSA Question not found" });
    }

    // Simulate test case results (replace with actual logic)
    const totalTestCases = question.testCases.length;
    const testCasesPassed = Math.floor(Math.random() * totalTestCases);
    const testCasesFailed = totalTestCases - testCasesPassed;

    // Calculate points (e.g., 10 points per passed test case)
    const pointsEarned = testCasesPassed * 10;

    // Save submission
    const submission = await Submission.create({
      user: req.user._id,
      question: questionId,
      code: sourceCode,
      language,
      status: testCasesFailed === 0 ? "passed" : "failed",
      testCasesPassed,
      testCasesFailed,
      pointsEarned,
    });

    // Update user points
    const user = await User.findById(req.user._id);
    user.points += pointsEarned;
    await user.save();

    // Check for badge eligibility
    const badges = await Badge.find();
    for (const badge of badges) {
      if (
        user.points >= badge.requiredPoints &&
        !user.badges.includes(badge._id)
      ) {
        user.badges.push(badge._id);
        await user.save();
      }
    }

    res.json({
      message: "Code submitted successfully",
      submission,
      user: { points: user.points, badges: user.badges },
    });
  } catch (error) {
    console.error("Error in submitCode:", error);
    res
      .status(500)
      .json({ message: "An error occurred while submitting code" });
  }
};
