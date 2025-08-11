// File: controllers/authController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Submission from "../models/Submission.js";
import DSAQuestion from "../models/DSAQuestion.js";

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


export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get recent submissions
    const recentSubmissions = await Submission.find({ user: req.user._id })
      .populate("question", "title difficulty")
      .sort({ createdAt: -1 })
      .limit(10);

    // Format submissions for frontend
    const formattedSubmissions = recentSubmissions.map((submission) => ({
      _id: submission._id,
      questionTitle: submission.question.title,
      status: submission.status,
      testCasesPassed: submission.testCasesPassed,
      testCasesFailed: submission.testCasesFailed,
      testCasesTotal: submission.testCasesPassed + submission.testCasesFailed,
      pointsEarned: submission.pointsEarned,
      date: submission.createdAt,
      language: submission.language,
    }));

    // Calculate total points from submissions (in case user.points is out of sync)
    const totalPointsFromSubmissions = await Submission.aggregate([
      { $match: { user: req.user._id, status: "Accepted" } },
      { $group: { _id: null, totalPoints: { $sum: "$pointsEarned" } } },
    ]);

    const calculatedPoints = totalPointsFromSubmissions[0]?.totalPoints || 0;

    // Update user points if they're out of sync
    if (user.points !== calculatedPoints) {
      await User.findByIdAndUpdate(req.user._id, { points: calculatedPoints });
      user.points = calculatedPoints;
    }

    res.json({
      user,
      submissions: formattedSubmissions,
      stats: {
        totalSubmissions: recentSubmissions.length,
        acceptedSubmissions: recentSubmissions.filter(
          (s) => s.status === "Accepted"
        ).length,
        totalPoints: user.points,
        badges: user.badges || [],
        streak: user.streakDays || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add this function to get user progress/stats
export const getUserProgress = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all badges (you might want to create actual Badge documents)
    const availableBadges = [
      {
        _id: "easy_starter",
        name: "Easy Starter",
        description: "Solve your first easy problem",
        requiredPoints: 5,
        earned: user.badges.includes("Easy Starter"),
      },
      {
        _id: "medium_challenger",
        name: "Medium Challenger",
        description: "Solve your first medium problem",
        requiredPoints: 10,
        earned: user.badges.includes("Medium Challenger"),
      },
      {
        _id: "hard_conqueror",
        name: "Hard Conqueror",
        description: "Solve your first hard problem",
        requiredPoints: 20,
        earned: user.badges.includes("Hard Conqueror"),
      },
      {
        _id: "week_streak",
        name: "7-Day Streak",
        description: "Maintain a 7-day solving streak",
        requiredPoints: 35,
        earned: user.badges.includes("7-Day Streak"),
      },
      {
        _id: "month_streak",
        name: "30-Day Streak",
        description: "Maintain a 30-day solving streak",
        requiredPoints: 150,
        earned: user.badges.includes("30-Day Streak"),
      },
    ];

    // Find next badge to earn
    const unearned = availableBadges.filter((badge) => !badge.earned);
    const nextBadge = unearned.sort(
      (a, b) => a.requiredPoints - b.requiredPoints
    )[0];

    res.json({
      points: user.points || 0,
      badges: availableBadges,
      nextBadge,
      streakDays: user.streakDays || 0,
      solvedQuestionsCount: user.solvedQuestionsCount || 0,
      mediumQuestionsSolved: user.mediumQuestionsSolved || 0,
      hardQuestionsSolved: user.hardQuestionsSolved || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
