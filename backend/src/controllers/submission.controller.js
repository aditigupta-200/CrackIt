import {
  createSubmission,
  getSubmissionResult,
} from "../services/judge0Service.js";
import Submission from "../models/Submission.js";
import DSAQuestion from "../models/DSAQuestion.js";
import { languages } from "../services/languages.js";
import User from "../models/User.js";
import Badge from "../models/Badge.js";
import UserBadge from "../models/UserBadge.js";
import { checkAndAwardBadges } from "./auth.controller.js";

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

    // Process each test case individually
    const testCaseResults = [];
    let allTestCasesPassed = true;

    for (let i = 0; i < question.testCases.length; i++) {
      const testCase = question.testCases[i];
      console.log(`Processing test case ${i + 1}:`, testCase);

      const expectedOutput = (testCase.expectedOutput || "").trim();
      // Handle multi-line inputs - for Judge0, we need to preserve line structure
      let formattedInput = testCase.input;

      console.log(
        `📝 Original input for test case ${i + 1}:`,
        JSON.stringify(formattedInput)
      );

      // If input was processed from frontend (space-separated), convert back to proper lines
      if (formattedInput && !formattedInput.includes("\n")) {
        // This is likely a space-separated input from frontend processing
        // We need to reconstruct the proper multi-line format based on the expected structure

        // For the array sum pairs problem, we expect: n, array elements, target
        const inputParts = formattedInput.split(" ");
        console.log(`📝 Input parts:`, inputParts);

        if (inputParts.length >= 3) {
          const n = inputParts[0];
          const target = inputParts[inputParts.length - 1];
          const arrayElements = inputParts
            .slice(1, inputParts.length - 1)
            .join(" ");

          formattedInput = `${n}\n${arrayElements}\n${target}`;
          console.log(
            `📝 Reconstructed input:`,
            JSON.stringify(formattedInput)
          );
        } else {
          // If we can't reconstruct properly, leave it as is but add warning
          console.log(
            `⚠️  Could not reconstruct input format for test case ${
              i + 1
            }, using original format`
          );
        }
      } else {
        // For multi-line inputs, preserve the structure but ensure proper line endings
        formattedInput = formattedInput.replace(/\r\n/g, "\n").trim();
        console.log(
          `📝 Multi-line input preserved:`,
          JSON.stringify(formattedInput)
        );
      }

      console.log(`📝 Test case ${i + 1} input processing:`, {
        original: testCase.input,
        formatted: formattedInput,
        expected: expectedOutput,
      });

      try {
        // Execute code for this test case
        const testCaseToken = await createSubmission(
          sourceCode,
          languageId,
          formattedInput
        );

        // Poll for result
        let testCaseOutput;
        let attempts = 0;
        const maxAttempts = 15;

        do {
          attempts++;
          console.log(
            `⏳ Test case ${
              i + 1
            } - Polling attempt ${attempts}/${maxAttempts}...`
          );

          if (attempts > 1) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }

          testCaseOutput = await getSubmissionResult(testCaseToken);

          if (attempts >= maxAttempts) {
            console.log(`⏰ Timeout reached for test case ${i + 1}`);
            testCaseResults.push({
              testCaseNumber: i + 1,
              input: testCase.input,
              expectedOutput,
              actualOutput: "Timeout",
              status: "timeout",
              passed: false,
              executionTime: null,
              memory: null,
              error: "Execution timeout",
            });
            allTestCasesPassed = false;
            break;
          }
        } while (testCaseOutput.status.id <= 2);

        if (attempts < maxAttempts) {
          const actualOutput = (testCaseOutput.stdout || "").trim();
          const passed = actualOutput === expectedOutput;

          if (!passed) {
            allTestCasesPassed = false;
          }

          testCaseResults.push({
            testCaseNumber: i + 1,
            input: testCase.input,
            expectedOutput,
            actualOutput,
            status: testCaseOutput.status.description.toLowerCase(),
            passed,
            executionTime: testCaseOutput.time,
            memory: testCaseOutput.memory,
            error: testCaseOutput.stderr || null,
          });

          console.log(`Test case ${i + 1} result:`, {
            expected: expectedOutput,
            actual: actualOutput,
            passed,
          });
        }
      } catch (error) {
        console.error(`Error processing test case ${i + 1}:`, error);
        testCaseResults.push({
          testCaseNumber: i + 1,
          input: testCase.input,
          expectedOutput,
          actualOutput: "Error",
          status: "error",
          passed: false,
          executionTime: null,
          memory: null,
          error: error.message,
        });
        allTestCasesPassed = false;
      }
    }

    // Calculate final results
    const passedCount = testCaseResults.filter((tc) => tc.passed).length;
    const failedCount = testCaseResults.length - passedCount;

    // Calculate points only if ALL test cases pass
    let pointsEarned = 0;
    if (allTestCasesPassed && passedCount > 0) {
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
    }

    // Save submission
    const submission = await Submission.create({
      user: req.user._id,
      question: questionId,
      code: sourceCode,
      language,
      status: allTestCasesPassed ? "Accepted" : "Wrong Answer",
      testCasesPassed: passedCount,
      testCasesFailed: failedCount,
      pointsEarned,
    });

    // Update user stats only if all test cases pass
    if (allTestCasesPassed && pointsEarned > 0) {
      const user = await User.findById(req.user._id);
      user.points += pointsEarned;
      user.solvedQuestionsCount += 1;
      user.questionsSolved += 1;

      if (question.difficulty === "medium") {
        user.mediumQuestionsSolved += 1;
      } else if (question.difficulty === "hard") {
        user.hardQuestionsSolved += 1;
      }

      // Award badges for first solve by difficulty
      // Update streak logic
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (user.lastSolvedDate === yesterday) {
        user.streakDays += 1;
        user.streak.daily += 1;
      } else if (user.lastSolvedDate !== today) {
        user.streakDays = 1;
        user.streak.daily = 1;
      }

      user.lastSolvedDate = today;
      user.streak.lastActiveDate = new Date();

      await user.save();

      // Check and award badges dynamically based on updated user stats
      const newBadges = await checkAndAwardBadges(user._id);
      if (newBadges.length > 0) {
        console.log(
          `🏆 ${newBadges.length} new badges awarded to user ${user._id}`
        );
      }

      console.log(
        `✅ User stats updated: Points: ${user.points}, Streak: ${user.streakDays} days`
      );
    }

    // Send comprehensive response
    res.json({
      message: allTestCasesPassed
        ? "All test cases passed!"
        : "Some test cases failed",
      success: allTestCasesPassed,
      submission: {
        _id: submission._id,
        status: submission.status,
        testCasesPassed: passedCount,
        testCasesFailed: failedCount,
        totalTestCases: testCaseResults.length,
        pointsEarned,
        allTestCasesPassed,
      },
      testCaseResults,
      summary: {
        totalTestCases: testCaseResults.length,
        passed: passedCount,
        failed: failedCount,
        passPercentage: Math.round(
          (passedCount / testCaseResults.length) * 100
        ),
      },
    });
  } catch (error) {
    console.error("❌ Error in runCode:", error);
    console.error("❌ Error stack:", error.stack);

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
  // This can be the same as runCode or you can keep it separate
  // For now, let's just call runCode
  return runCode(req, res);
};
