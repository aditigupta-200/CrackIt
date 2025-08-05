import express from "express";
import {
  createInterview,
  getAllInterviews,
  applyForInterview,
} from "../controllers/interview.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();
router.post("/", verifyJWT, authorizeRoles("interviewer"), createInterview);
router.get("/", verifyJWT, getAllInterviews);
router.post("/apply", verifyJWT, authorizeRoles("candidate"), applyForInterview);

export default router;
