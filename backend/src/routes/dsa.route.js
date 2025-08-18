import express from "express";
import {
  getAllQuestions,
  getQuestionById,
  submitSolution,
  runCode,
  getSubmissionHistory,
  getSubmissionById,
  createQuestion,
  // Legacy exports for backward compatibility
  addDSAQuestion,
  getAllDSAQuestions,
} from "../controllers/dsa.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Public routes (with authentication)
router.use(verifyJWT);

// GET /api/dsa/questions - Get all questions with filtering and pagination
router.get("/questions", getAllQuestions);

// GET /api/dsa/questions/:id - Get specific question with boilerplate
router.get("/questions/:id", getQuestionById);

// POST /api/dsa/submit - Submit solution for evaluation
router.post("/submit", submitSolution);

// POST /api/dsa/run - Run code against sample test cases
router.post("/run", runCode);

// GET /api/dsa/submissions/:questionId - Get submission history for a question
router.get("/submissions/:questionId", getSubmissionHistory);

// GET /api/dsa/submission/:submissionId - Get specific submission details
router.get("/submission/:submissionId", getSubmissionById);

// Admin routes
// POST /api/dsa/questions - Create new question (Admin only)
router.post(
  "/questions",
  authorizeRoles("super_admin", "admin"),
  createQuestion
);

// Legacy routes for backward compatibility
router.post("/", authorizeRoles("super_admin"), addDSAQuestion);
router.get("/", getAllDSAQuestions);

export default router;
