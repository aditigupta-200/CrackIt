// File: routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  logout,
  updateProfile,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import User from "../models/User.js"; // Import the User model

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", verifyJWT, updateProfile); // Protected route for all authenticated users
router.get("/profile", verifyJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
