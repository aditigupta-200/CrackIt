import express from "express";
import {
  runCode,
  submitCode,
  getUserSubmissions,
  getUserSubmissionsByQuestion,
} from "../controllers/submission.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/run", verifyJWT, runCode);
router.post("/submit", verifyJWT, submitCode);
router.get("/my", verifyJWT, getUserSubmissions);
router.get("/question/:questionId", verifyJWT, getUserSubmissionsByQuestion);

export default router;
