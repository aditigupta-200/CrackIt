// File: routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  logout,
  updateProfile,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", verifyJWT, updateProfile); // Protected route for all authenticated users

export default router;
