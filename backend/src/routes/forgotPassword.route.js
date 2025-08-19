import express from "express";
import {
  requestPasswordReset,
  verifyOTP,
  resetPassword,
  resendOTP,
} from "../controllers/forgotPassword.controller.js";

const router = express.Router();

// Request password reset (send OTP)
router.post("/request", requestPasswordReset);

// Verify OTP
router.post("/verify-otp", verifyOTP);

// Reset password with token
router.post("/reset", resetPassword);

// Resend OTP
router.post("/resend-otp", resendOTP);

export default router;
