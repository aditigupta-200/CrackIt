import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com/submissions";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// 1. Create submission
export const createSubmission = async (sourceCode, languageId, input) => {
  try {
    console.log("📤 Sending to Judge0 API...");
    console.log("🔑 Using API Key:", RAPIDAPI_KEY ? "Present" : "Missing");

    const response = await axios.post(
      `${JUDGE0_API_URL}?base64_encoded=false&wait=false`,
      {
        source_code: sourceCode,
        language_id: languageId,
        stdin: input || "",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    );

    console.log("✅ Judge0 response:", response.data);
    return response.data.token;
  } catch (error) {
    console.error(
      "❌ Judge0 createSubmission error:",
      error.response?.data || error.message
    );

    if (error.response?.data) {
      throw new Error(
        `Judge0 API Error: ${JSON.stringify(error.response.data)}`
      );
    } else if (error.message) {
      throw new Error(`Network Error: ${error.message}`);
    } else {
      throw new Error("Failed to create submission");
    }
  }
};

// 2. Fetch result
export const getSubmissionResult = async (token) => {
  try {
    const response = await axios.get(`${JUDGE0_API_URL}/${token}`, {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "❌ Judge0 getSubmissionResult error:",
      error.response?.data || error.message
    );

    if (error.response?.data) {
      throw new Error(
        `Judge0 API Error: ${JSON.stringify(error.response.data)}`
      );
    } else if (error.message) {
      throw new Error(`Network Error: ${error.message}`);
    } else {
      throw new Error("Failed to fetch submission result");
    }
  }
};
