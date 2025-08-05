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
    // Ensure question exists
    const question = await DSAQuestion.findById(questionId);
    if (!question)
      return res.status(404).json({ message: "DSA Question not found" });

    // Get Judge0 language ID
    const languageId = languages[language];
    if (!languageId)
      return res.status(400).json({ message: "Unsupported language" });

    // Step 1: Send code to Judge0
    const token = await createSubmission(sourceCode, languageId, input);

    // Step 2: Poll Judge0 until execution completes
    let result;
    do {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 sec
      result = await getSubmissionResult(token);
    } while (result.status.id <= 2); // 1 = In Queue, 2 = Processing

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
      submission,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
