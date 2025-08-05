import express from "express";
import { createBadge, getUserBadges } from "../controllers/badge.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();
router.post("/", verifyJWT, authorizeRoles("super_admin"), createBadge);
router.get("/my", verifyJWT, getUserBadges);

export default router;
