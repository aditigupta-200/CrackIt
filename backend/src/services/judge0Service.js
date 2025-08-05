import axios from "axios";

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com/submissions";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // Store in .env

// 1. Create submission
export const createSubmission = async (sourceCode, languageId, input) => {
  try {
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
    return response.data.token;
  } catch (error) {
    throw new Error(error.response?.data || "Error creating submission");
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
    throw new Error(error.response?.data || "Error fetching submission result");
  }
};
