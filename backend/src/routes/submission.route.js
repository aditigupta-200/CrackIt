import express from "express";
import { runCode } from "../controllers/submission.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/run", verifyJWT, runCode);

export default router;
