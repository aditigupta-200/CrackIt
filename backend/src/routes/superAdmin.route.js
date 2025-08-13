import express from "express";
import {
  getAllUsers,
  getUserDetails,
  updateUserRole,
  restrictUser,
  getDashboardStats,
  getUserActivities,
} from "../controllers/superAdmin.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(verifyJWT);
router.use(checkRole(["super_admin"]));

router.get("/users", getAllUsers);
router.get("/stats", getDashboardStats);
router.get("/activities", getUserActivities);
router.get("/users/:userId", getUserDetails);
router.put("/users/:userId/role", updateUserRole);
router.put("/users/:userId/restrict", restrictUser);

export default router;
