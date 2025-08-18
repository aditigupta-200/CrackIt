import express from "express";
import {
  createBadge,
  getUserBadges,
  getAllBadges,
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

// User routes (authenticated)
router.get("/my", verifyJWT, getUserBadges);

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
router.get("/stats", verifyJWT, authorizeRoles("super_admin"), getBadgeStats);

export default router;
