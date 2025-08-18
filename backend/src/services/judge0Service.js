import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const JUDGE0_URL = process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Language mappings for Judge0
export const LANGUAGE_IDS = {
  javascript: 93, // Node.js
  python: 92, // Python 3.11
  java: 91, // Java 17
  cpp: 105, // C++ 17
  c: 104, // C 18
};

class Judge0Service {
  constructor() {
    this.apiClient = axios.create({
      baseURL: JUDGE0_URL,
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    });
  }

  // Get supported languages
  async getLanguages() {
    try {
      const response = await this.apiClient.get("/languages");
      return response.data;
    } catch (error) {
      console.error("Error fetching languages:", error);
      throw error;
    }
  }

  // Submit code for execution
  async submitCode(sourceCode, languageId, stdin = "", expectedOutput = "") {
    try {
      const payload = {
        source_code: sourceCode,
        language_id: languageId,
        stdin: stdin || "",
        expected_output: expectedOutput || "",
        base64_encoded: false,
        wait: false,
      };

      console.log("📤 Submitting to Judge0:", { languageId, stdin: !!stdin });

      const response = await this.apiClient.post(
        "/submissions?fields=*",
        payload
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error submitting code:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  // Get submission result
  async getSubmission(token) {
    try {
      const response = await this.apiClient.get(
        `/submissions/${token}?fields=*`
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error getting submission:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  // Submit batch of test cases
  async submitBatch(submissions) {
    try {
      const payload = { submissions };
      const response = await this.apiClient.post(
        "/submissions/batch?fields=*",
        payload
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error submitting batch:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  // Wait for submission to complete
  async waitForSubmission(token, maxAttempts = 20, delay = 1000) {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.getSubmission(token);

      if (result.status.id <= 2) {
        // Still processing (1: In Queue, 2: Processing)
        console.log(
          `⏳ Submission ${token} still processing... (${result.status.description})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      console.log(
        `✅ Submission ${token} completed: ${result.status.description}`
      );
      return result;
    }

    throw new Error("Submission timed out");
  }

  // Execute code with test cases
  async executeWithTestCases(sourceCode, language, testCases) {
    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const results = [];
    let overallStatus = "Accepted";

    console.log(`🧪 Running ${testCases.length} test cases for ${language}...`);

    for (const [index, testCase] of testCases.entries()) {
      try {
        console.log(`📝 Running test case ${index + 1}/${testCases.length}`);

        // Submit code
        const submission = await this.submitCode(
          sourceCode,
          languageId,
          testCase.input,
          testCase.expectedOutput
        );

        if (!submission.token) {
          throw new Error("No token received from Judge0");
        }

        // Wait for result
        const result = await this.waitForSubmission(submission.token);

        // Determine status
        let testStatus = "Passed";
        let actualOutput = result.stdout || "";

        if (result.status.id === 3) {
          // Accepted
          if (actualOutput.trim() !== testCase.expectedOutput.trim()) {
            testStatus = "Wrong Answer";
            overallStatus = "Wrong Answer";
          }
        } else {
          testStatus = this.getStatusName(result.status.id);
          overallStatus = testStatus;
        }

        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: actualOutput.trim(),
          status: testStatus,
          runtime: parseFloat(result.time) * 1000 || 0, // Convert to ms
          memory: parseInt(result.memory) || 0,
          stderr: result.stderr || "",
          judge0Status: result.status.description,
        });

        console.log(
          `${testStatus === "Passed" ? "✅" : "❌"} Test case ${
            index + 1
          }: ${testStatus}`
        );

        // Stop on first failure for efficiency
        if (testStatus !== "Passed") {
          console.log(`🛑 Stopping execution due to failure: ${testStatus}`);
          break;
        }
      } catch (error) {
        console.error(`❌ Error in test case ${index + 1}:`, error.message);
        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: "",
          status: "Runtime Error",
          runtime: 0,
          memory: 0,
          stderr: error.message,
          judge0Status: "Execution Error",
        });
        overallStatus = "Runtime Error";
        break;
      }
    }

    const totalRuntime = results.reduce((sum, r) => sum + r.runtime, 0);
    const totalMemory = Math.max(...results.map((r) => r.memory), 0);

    console.log(
      `📊 Execution completed: ${overallStatus} (${totalRuntime}ms, ${totalMemory}KB)`
    );

    return {
      status: overallStatus,
      results,
      totalRuntime,
      totalMemory,
    };
  }

  getStatusName(statusId) {
    const statusMap = {
      1: "In Queue",
      2: "Processing",
      3: "Accepted",
      4: "Wrong Answer",
      5: "Time Limit Exceeded",
      6: "Compilation Error",
      7: "Runtime Error (SIGSEGV)",
      8: "Runtime Error (SIGXFSZ)",
      9: "Runtime Error (SIGFPE)",
      10: "Runtime Error (SIGABRT)",
      11: "Runtime Error (NZEC)",
      12: "Runtime Error (Other)",
      13: "Internal Error",
      14: "Exec Format Error",
    };
    return statusMap[statusId] || "Unknown";
  }

  // Combine boilerplate with user code
  combineCode(boilerplate, userCode, language) {
    if (!boilerplate || !userCode) {
      throw new Error("Boilerplate and user code are required");
    }

    // Replace the placeholder with user code
    let combinedCode = boilerplate.replace(
      /\/\/ USER_CODE_HERE|# USER_CODE_HERE/g,
      userCode
    );

    // For Java, we need special handling
    if (language.toLowerCase() === "java") {
      // The boilerplate should already contain proper structure
      // Just replace the placeholder
      combinedCode = boilerplate.replace("// USER_CODE_HERE", userCode);
    }

    return combinedCode;
  }
}

// Legacy functions for backward compatibility
export const createSubmission = async (sourceCode, languageId, input) => {
  const judge0 = new Judge0Service();
  const submission = await judge0.submitCode(sourceCode, languageId, input);
  return submission.token;
};

export const getSubmissionResult = async (token) => {
  const judge0 = new Judge0Service();
  return await judge0.getSubmission(token);
};

export default new Judge0Service();
