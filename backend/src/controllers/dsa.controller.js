import DSAQuestion from "../models/DSAQuestion.js";
import Submission from "../models/Submission.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import judge0Service, { LANGUAGE_IDS } from "../services/judge0Service.js";

// Get all DSA questions with pagination and filtering
export const getAllQuestions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    difficulty,
    category,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build filter object
  const filter = {};
  if (difficulty) filter.difficulty = difficulty;
  if (category) filter.category = { $regex: category, $options: "i" };
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const questions = await DSAQuestion.find(filter, {
    // Exclude sensitive data
    testCases: 0,
    boilerplates: 0,
  })
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await DSAQuestion.countDocuments(filter);

  res.json(
    new ApiResponse(
      200,
      {
        questions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalQuestions: total,
          hasNext: skip + questions.length < total,
          hasPrev: parseInt(page) > 1,
        },
      },
      "Questions fetched successfully"
    )
  );
});

// Get single question with boilerplate for specific language
export const getQuestionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { language = "javascript" } = req.query;

  const question = await DSAQuestion.findById(id);
  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  // Get user's submission history for this question
  const submissions = await Submission.find({
    question: id,
    user: req.user._id,
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("status runtime memory createdAt language");

  // Prepare response with boilerplate for requested language
  const boilerplate =
    question.boilerplates?.get(language.toLowerCase()) ||
    question.boilerplates?.get("javascript") ||
    "// Write your solution here";

  // Only show first few test cases (not all for security)
  const visibleTestCases = question.testCases
    .filter((tc) => tc.isVisible !== false)
    .slice(0, 3)
    .map((tc) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      explanation: tc.explanation,
    }));

  res.json(
    new ApiResponse(
      200,
      {
        question: {
          _id: question._id,
          title: question.title,
          description: question.description,
          difficulty: question.difficulty,
          category: question.category,
          constraints: question.constraints,
          examples: question.examples,
          hints: question.hints,
          boilerplate,
          testCases: visibleTestCases,
          supportedLanguages: question.boilerplates
            ? Array.from(question.boilerplates.keys())
            : ["javascript", "python", "java"],
        },
        submissions,
      },
      "Question fetched successfully"
    )
  );
});

// Submit solution and run against test cases
export const submitSolution = asyncHandler(async (req, res) => {
  const { questionId, code, language = "javascript" } = req.body;
  const userId = req.user._id;

  if (!questionId || !code) {
    throw new ApiError(400, "Question ID and code are required");
  }

  // Fetch the question
  const question = await DSAQuestion.findById(questionId);
  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  // Validate language support
  if (!LANGUAGE_IDS[language.toLowerCase()]) {
    throw new ApiError(400, `Unsupported language: ${language}`);
  }

  try {
    // Get boilerplate and combine with user code
    const boilerplate = question.boilerplates?.get(language.toLowerCase());
    if (!boilerplate) {
      throw new ApiError(400, `No boilerplate available for ${language}`);
    }

    const combinedCode = judge0Service.combineCode(boilerplate, code, language);

    // Prepare test cases
    const testCases = question.testCases.map((tc) => {
      // Process input to handle multi-line format properly
      let formattedInput = tc.input.trim();

      // If input was processed from frontend (space-separated), convert back to proper lines
      if (formattedInput && !formattedInput.includes("\n")) {
        // This is likely a space-separated input from frontend processing
        // We need to reconstruct the proper multi-line format based on the expected structure

        // For the array sum pairs problem, we expect: n, array elements, target
        const inputParts = formattedInput.split(" ");
        if (inputParts.length >= 3) {
          const n = inputParts[0];
          const target = inputParts[inputParts.length - 1];
          const arrayElements = inputParts
            .slice(1, inputParts.length - 1)
            .join(" ");

          formattedInput = `${n}\n${arrayElements}\n${target}`;
        }
      }

      return {
        input: formattedInput,
        expectedOutput: tc.expectedOutput.trim(),
      };
    });

    if (testCases.length === 0) {
      throw new ApiError(400, "No test cases available for this question");
    }

    console.log(`🚀 Executing submission for question: ${question.title}`);

    // Execute code with Judge0
    const executionResult = await judge0Service.executeWithTestCases(
      combinedCode,
      language,
      testCases
    );

    // Calculate percentiles (mock calculation - in production, use historical data)
    const runtimePercentile = Math.floor(Math.random() * 100) + 1;
    const memoryPercentile = Math.floor(Math.random() * 100) + 1;

    // Create submission record
    const submission = new Submission({
      user: userId,
      question: questionId,
      code,
      language,
      status: executionResult.status,
      runtime: executionResult.totalRuntime,
      memory: executionResult.totalMemory,
      testCaseResults: executionResult.results,
      testCasesPassed: executionResult.results.filter(
        (r) => r.status === "Passed"
      ).length,
      testCasesFailed: executionResult.results.filter(
        (r) => r.status !== "Passed"
      ).length,
    });

    await submission.save();

    // Return detailed results
    res.json(
      new ApiResponse(
        200,
        {
          submissionId: submission._id,
          status: executionResult.status,
          runtime: executionResult.totalRuntime,
          memory: executionResult.totalMemory,
          runtimePercentile,
          memoryPercentile,
          testResults: executionResult.results.map((result, index) => ({
            testCase: index + 1,
            status: result.status,
            input: result.input,
            expectedOutput: result.expectedOutput,
            actualOutput: result.actualOutput,
            runtime: result.runtime,
            memory: result.memory,
            error: result.stderr,
          })),
          totalTestCases: testCases.length,
          passedTestCases: executionResult.results.filter(
            (r) => r.status === "Passed"
          ).length,
        },
        `Submission ${executionResult.status.toLowerCase()}`
      )
    );
  } catch (error) {
    console.error("❌ Submission execution error:", error);

    // Create failed submission record
    const submission = new Submission({
      user: userId,
      question: questionId,
      code,
      language,
      status: "Runtime Error",
      runtime: 0,
      memory: 0,
      testCaseResults: [],
      testCasesPassed: 0,
      testCasesFailed: 1,
    });

    await submission.save();

    throw new ApiError(500, `Execution failed: ${error.message}`);
  }
});

// Run code against sample test cases (without saving submission)
export const runCode = asyncHandler(async (req, res) => {
  const { questionId, code, language = "javascript" } = req.body;

  if (!questionId || !code) {
    throw new ApiError(400, "Question ID and code are required");
  }

  const question = await DSAQuestion.findById(questionId);
  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  if (!LANGUAGE_IDS[language.toLowerCase()]) {
    throw new ApiError(400, `Unsupported language: ${language}`);
  }

  try {
    const boilerplate = question.boilerplates?.get(language.toLowerCase());
    if (!boilerplate) {
      throw new ApiError(400, `No boilerplate available for ${language}`);
    }

    const combinedCode = judge0Service.combineCode(boilerplate, code, language);

    // Use only visible test cases for run (not submit)
    const testCases = question.testCases
      .filter((tc) => tc.isVisible !== false)
      .slice(0, 3) // Limit to first 3 test cases
      .map((tc) => {
        // Process input to handle multi-line format properly
        let formattedInput = tc.input.trim();

        console.log(
          `📝 DSA runCode - Original input:`,
          JSON.stringify(formattedInput)
        );

        // If input was processed from frontend (space-separated), convert back to proper lines
        if (formattedInput && !formattedInput.includes("\n")) {
          // This is likely a space-separated input from frontend processing
          // We need to reconstruct the proper multi-line format based on the expected structure

          // For the array sum pairs problem, we expect: n, array elements, target
          const inputParts = formattedInput.split(" ");
          console.log(`📝 DSA runCode - Input parts:`, inputParts);

          if (inputParts.length >= 3) {
            const n = inputParts[0];
            const target = inputParts[inputParts.length - 1];
            const arrayElements = inputParts
              .slice(1, inputParts.length - 1)
              .join(" ");

            formattedInput = `${n}\n${arrayElements}\n${target}`;
            console.log(
              `📝 DSA runCode - Reconstructed input:`,
              JSON.stringify(formattedInput)
            );
          } else {
            // If we can't reconstruct properly, leave it as is but add warning
            console.log(
              `⚠️  DSA runCode - Could not reconstruct input format, using original format`
            );
          }
        }

        return {
          input: formattedInput,
          expectedOutput: tc.expectedOutput.trim(),
        };
      });

    console.log(`▶️  Running code for question: ${question.title}`);

    const executionResult = await judge0Service.executeWithTestCases(
      combinedCode,
      language,
      testCases
    );

    res.json(
      new ApiResponse(
        200,
        {
          status: executionResult.status,
          runtime: executionResult.totalRuntime,
          memory: executionResult.totalMemory,
          testResults: executionResult.results.map((result, index) => ({
            testCase: index + 1,
            status: result.status,
            input: result.input,
            expectedOutput: result.expectedOutput,
            actualOutput: result.actualOutput,
            runtime: result.runtime,
            memory: result.memory,
            error: result.stderr,
          })),
        },
        "Code executed successfully"
      )
    );
  } catch (error) {
    console.error("❌ Code execution error:", error);
    throw new ApiError(500, `Execution failed: ${error.message}`);
  }
});

// Create new question (Admin only)
export const createQuestion = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    difficulty,
    category,
    constraints,
    examples,
    testCases,
    boilerplates,
    hints,
  } = req.body;

  if (!title || !description || !difficulty || !testCases) {
    throw new ApiError(
      400,
      "Title, description, difficulty, and test cases are required"
    );
  }

  // Convert boilerplates object to Map
  const boilerplateMap = new Map();
  if (boilerplates) {
    Object.entries(boilerplates).forEach(([lang, code]) => {
      boilerplateMap.set(lang.toLowerCase(), code);
    });
  }

  const question = new DSAQuestion({
    title,
    description,
    difficulty,
    category: category || "General",
    constraints,
    examples: examples || [],
    testCases,
    boilerplates: boilerplateMap,
    hints: hints || [],
    createdBy: req.user._id, // Add the logged-in user as creator
  });

  await question.save();

  res
    .status(201)
    .json(new ApiResponse(201, { question }, "Question created successfully"));
});

// Get submission history for a specific question and user
export const getSubmissionHistory = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const userId = req.user._id;

  const submissions = await Submission.find({
    question: questionId,
    user: userId,
  })
    .sort({ createdAt: -1 })
    .select("status runtime memory createdAt language")
    .populate("question", "title");

  res.json(
    new ApiResponse(
      200,
      { submissions },
      "Submission history fetched successfully"
    )
  );
});

// Get specific submission details
export const getSubmissionById = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const userId = req.user._id;

  const submission = await Submission.findOne({
    _id: submissionId,
    user: userId,
  }).populate("question", "title");

  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  res.json(
    new ApiResponse(
      200,
      { submission },
      "Submission details fetched successfully"
    )
  );
});

// Legacy functions for backward compatibility
export const addDSAQuestion = createQuestion;
export const getAllDSAQuestions = getAllQuestions;
