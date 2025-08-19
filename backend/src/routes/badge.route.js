import express from "express";
import {
  createBadge,
  getUserBadges,
  getAllBadges,
  getBadgeById,
  updateBadge,
  deleteBadge,
  awardBadgeToUser,
  getBadgeStats,
} from "../controllers/badge.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllBadges);

// User routes (authenticated) - MUST come before /:id route
router.get("/my", verifyJWT, getUserBadges);
router.get("/stats", verifyJWT, authorizeRoles("super_admin"), getBadgeStats);

// Public route for sharing - MUST come after specific routes
router.get("/:id", getBadgeById);

// Admin routes (super admin only)
router.post("/", verifyJWT, authorizeRoles("super_admin"), createBadge);
router.put("/:id", verifyJWT, authorizeRoles("super_admin"), updateBadge);
router.delete("/:id", verifyJWT, authorizeRoles("super_admin"), deleteBadge);
router.post(
  "/award",
  verifyJWT,
  authorizeRoles("super_admin"),
  awardBadgeToUser
);

export default router;
