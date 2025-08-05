import express from "express";
import {
  addDSAQuestion,
  getAllDSAQuestions,
} from "../controllers/dsa.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();
router.post("/", verifyJWT, authorizeRoles("super_admin"), addDSAQuestion);
router.get("/", verifyJWT, getAllDSAQuestions);

export default router;
