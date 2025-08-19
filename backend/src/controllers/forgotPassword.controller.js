import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendPasswordResetOTP } from "../services/emailService.js";

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request password reset (send OTP)
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "No account found with this email address");
  }

  // Delete any existing OTPs for this user
  await OTP.deleteMany({ email });

  // Generate new OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

  // Save OTP to database
  await OTP.create({
    email,
    otp,
    expiresAt,
    attempts: 0,
  });

  try {
    // Send OTP email
    await sendPasswordResetOTP(email, otp, user.username);

    res.json(
      new ApiResponse(
        200,
        { email },
        "Password reset OTP sent to your email. Please check your inbox."
      )
    );
  } catch (error) {
    // Clean up OTP if email sending fails
    await OTP.deleteMany({ email });
    console.error("Error sending password reset email:", error);
    throw new ApiError(
      500,
      "Failed to send password reset email. Please try again later."
    );
  }
});

// Verify OTP
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  // Find OTP record
  const otpRecord = await OTP.findOne({ email });
  if (!otpRecord) {
    throw new ApiError(
      400,
      "Invalid or expired OTP. Please request a new one."
    );
  }

  // Check if OTP has expired
  if (new Date() > otpRecord.expiresAt) {
    await OTP.deleteMany({ email });
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  // Check attempt limit (max 5 attempts)
  if (otpRecord.attempts >= 5) {
    await OTP.deleteMany({ email });
    throw new ApiError(
      429,
      "Too many failed attempts. Please request a new OTP."
    );
  }

  // Verify OTP
  if (otpRecord.otp !== otp) {
    // Increment attempts
    otpRecord.attempts += 1;
    await otpRecord.save();

    throw new ApiError(
      400,
      `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`
    );
  }

  // Generate password reset token
  const resetToken = randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  // Update user with reset token
  const user = await User.findOne({ email });
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetTokenExpiry;
  await user.save();

  // Delete OTP after successful verification
  await OTP.deleteMany({ email });

  res.json(
    new ApiResponse(
      200,
      { resetToken },
      "OTP verified successfully. You can now reset your password."
    )
  );
});

// Reset password with token
export const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    throw new ApiError(400, "Reset token and new password are required");
  }

  // Validate password strength
  if (newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  // Find user by reset token
  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  // Update user password and clear reset token
  // Set the password directly - the pre-save middleware will handle hashing
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Clean up any remaining OTPs for this user
  await OTP.deleteMany({ email: user.email });

  res.json(
    new ApiResponse(
      200,
      {},
      "Password reset successfully. You can now login with your new password."
    )
  );
});

// Resend OTP
export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "No account found with this email address");
  }

  // Check if there's an existing OTP that's still valid (prevent spam)
  const existingOTP = await OTP.findOne({ email });
  if (existingOTP && new Date() < existingOTP.expiresAt) {
    const remainingTime = Math.ceil(
      (existingOTP.expiresAt - new Date()) / 60000
    );
    throw new ApiError(
      429,
      `Please wait ${remainingTime} minutes before requesting a new OTP`
    );
  }

  // Delete any existing OTPs
  await OTP.deleteMany({ email });

  // Generate new OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Save OTP
  await OTP.create({
    email,
    otp,
    expiresAt,
    attempts: 0,
  });

  try {
    // Send OTP email
    await sendPasswordResetOTP(email, otp, user.username);

    res.json(
      new ApiResponse(
        200,
        { email },
        "New OTP sent to your email. Please check your inbox."
      )
    );
  } catch (error) {
    // Clean up OTP if email sending fails
    await OTP.deleteMany({ email });
    console.error("Error sending OTP email:", error);
    throw new ApiError(
      500,
      "Failed to send OTP email. Please try again later."
    );
  }
});

export default {
  requestPasswordReset,
  verifyOTP,
  resetPassword,
  resendOTP,
};
