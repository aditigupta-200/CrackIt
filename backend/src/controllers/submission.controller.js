import {
  createSubmission,
  getSubmissionResult,
} from "../services/judge0Service.js";
import Submission from "../models/Submission.js";
import DSAQuestion from "../models/DSAQuestion.js";
import { languages } from "../services/languages.js";

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
    });
    console.log("💾 Submission saved:", submission._id);

    // Step 4: Return execution result
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
