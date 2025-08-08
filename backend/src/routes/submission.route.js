import express from "express";
import { runCode, submitCode } from "../controllers/submission.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/run", verifyJWT, runCode);
router.post("/submit", verifyJWT, submitCode);

export default router;
