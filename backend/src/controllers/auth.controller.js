// File: controllers/authController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import BlacklistedToken from "../models/BlacklistedToken.js";

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(400, "User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    username,
    email,
    password,
    role,
  });

  res.status(201).json({
    _id: newUser._id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
    token: generateToken(newUser),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(400, "Invalid email or password");
  }

  res.cookie("accessToken", generateToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    token: generateToken(user),
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken");
  res.json({ message: "Logged out successfully" });
});

// export const logoutUser = async (req, res) => {
//   try {
//     await BlacklistedToken.create({ token, expiresAt });
//     res.json({ message: "Logged out successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;
  const updateData = req.body;

  // Define fields that can be updated based on role
  const rolePermissions = {
    candidate: ["username", "email"], // Changed from "name" to "username"
    interviewer: ["username", "email"],
    super_admin: ["username", "email", "role"], // Can update role
  };

  // Fields that are always restricted (cannot be updated via this endpoint)
  const restrictedFields = ["password", "_id", "createdAt", "updatedAt"];

  // Get allowed fields for the user's role
  const allowedFields = rolePermissions[userRole] || rolePermissions.candidate;

  // Filter update data to only include allowed fields
  const filteredUpdateData = {};

  for (const field in updateData) {
    if (restrictedFields.includes(field)) {
      throw new ApiError(
        400,
        `Field '${field}' cannot be updated through this endpoint`
      );
    }

    if (allowedFields.includes(field)) {
      filteredUpdateData[field] = updateData[field];
    } else {
      throw new ApiError(
        403,
        `You don't have permission to update field '${field}'`
      );
    }
  }

  // Special validation for role updates (only super_admin can do this)
  if (filteredUpdateData.role && userRole !== "super_admin") {
    throw new ApiError(403, "Only super admins can update user roles");
  }

  // Validate role value if being updated
  if (filteredUpdateData.role) {
    const validRoles = ["candidate", "interviewer", "super_admin"]; // Updated to match User model
    if (!validRoles.includes(filteredUpdateData.role)) {
      throw new ApiError(400, "Invalid role specified");
    }
  }

  // Check if there are any fields to update
  if (Object.keys(filteredUpdateData).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  // Check if email is being updated and if it already exists
  if (filteredUpdateData.email) {
    const existingUser = await User.findOne({
      email: filteredUpdateData.email,
      _id: { $ne: userId },
    });
    if (existingUser) {
      throw new ApiError(400, "Email already exists");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, filteredUpdateData, {
    new: true,
    runValidators: true,
    select: "-password",
  });

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  res.json({
    message: "Profile updated successfully",
    user: updatedUser,
    updatedFields: Object.keys(filteredUpdateData),
  });
});
