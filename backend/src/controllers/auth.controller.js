// File: controllers/authController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Badge from "../models/Badge.js";
import UserBadge from "../models/UserBadge.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Submission from "../models/Submission.js";
import DSAQuestion from "../models/DSAQuestion.js";
import { OAuth2Client } from "google-auth-library";

// Replace with your Google Client ID
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

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

// Helper function to check if user meets badge criteria
const checkBadgeEligibility = (badge, userStats) => {
  const { criteria } = badge;
  const { type, value, operator = "greater_equal" } = criteria;

  let userValue;
  switch (type) {
    case "difficulty":
      // For difficulty badges, check if user solved at least 1 problem of that difficulty
      userValue = userStats.difficultyBreakdown[value.toLowerCase()] || 0;
      return userValue > 0;
    case "streak":
      userValue = userStats.streakDays || 0;
      break;
    case "total_problems":
      userValue = userStats.solvedQuestionsCount || 0;
      break;
    case "points":
      userValue = userStats.points || 0;
      break;
    default:
      return false;
  }

  switch (operator) {
    case "equals":
      return userValue === value;
    case "greater_than":
      return userValue > value;
    case "greater_equal":
      return userValue >= value;
    default:
      return false;
  }
};

// Add this function to get user progress/stats
export const getUserProgress = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all active badges from database
    const allBadges = await Badge.find({ isActive: true }).sort({
      requiredPoints: 1,
    });

    // Get user's earned badges
    const userBadges = await UserBadge.find({ user: req.user._id }).populate(
      "badge"
    );
    const earnedBadgeIds = userBadges.map((ub) => ub.badge._id.toString());

    // Calculate difficulty breakdown from submissions
    const submissions = await Submission.find({
      user: req.user._id,
      status: "Accepted",
    }).populate("question", "difficulty");

    console.log(
      `[DEBUG] User ${req.user._id} has ${submissions.length} accepted submissions`
    );

    const difficultyBreakdown = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    submissions.forEach((submission) => {
      const difficulty = submission.question?.difficulty?.toLowerCase();
      if (difficultyBreakdown.hasOwnProperty(difficulty)) {
        difficultyBreakdown[difficulty]++;
      }
    });

    // Calculate total solved questions from actual submissions
    const totalSolvedQuestions = submissions.length;

    console.log(`[DEBUG] Difficulty breakdown:`, difficultyBreakdown);
    console.log(`[DEBUG] Total solved questions:`, totalSolvedQuestions);

    // Update user's solved question counts if they're different
    if (user.solvedQuestionsCount !== totalSolvedQuestions) {
      await User.findByIdAndUpdate(req.user._id, {
        solvedQuestionsCount: totalSolvedQuestions,
        mediumQuestionsSolved: difficultyBreakdown.medium,
        hardQuestionsSolved: difficultyBreakdown.hard,
      });
    }

    // Prepare user stats for badge checking
    const userStats = {
      points: user.points || 0,
      streakDays: user.streakDays || 0,
      solvedQuestionsCount: totalSolvedQuestions,
      difficultyBreakdown,
    };

    // Check badge eligibility and format badges
    const formattedBadges = allBadges.map((badge) => {
      const isEarned = earnedBadgeIds.includes(badge._id.toString());
      const isEligible = !isEarned && checkBadgeEligibility(badge, userStats);

      return {
        _id: badge._id,
        name: badge.name,
        description: badge.description,
        requiredPoints: badge.requiredPoints,
        criteria: badge.criteria,
        icon: badge.icon,
        color: badge.color,
        earned: isEarned,
        eligible: isEligible,
        awardedAt: isEarned
          ? userBadges.find(
              (ub) => ub.badge._id.toString() === badge._id.toString()
            )?.awardedAt
          : null,
      };
    });

    // Find next badge to earn (lowest required points among unearned badges)
    const unearnedBadges = formattedBadges.filter((badge) => !badge.earned);
    const nextBadge = unearnedBadges.sort(
      (a, b) => a.requiredPoints - b.requiredPoints
    )[0];

    res.json({
      points: user.points || 0,
      badges: formattedBadges,
      nextBadge,
      streakDays: user.streakDays || 0,
      solvedQuestionsCount: totalSolvedQuestions,
      mediumQuestionsSolved: difficultyBreakdown.medium,
      hardQuestionsSolved: difficultyBreakdown.hard,
      difficultyBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Function to automatically award badges based on user progress
export const checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Get all active badges
    const allBadges = await Badge.find({ isActive: true });

    // Get user's current badges
    const userBadges = await UserBadge.find({ user: userId });
    const earnedBadgeIds = userBadges.map((ub) => ub.badge.toString());

    // Calculate user stats
    const submissions = await Submission.find({
      user: userId,
      status: "Accepted",
    }).populate("question", "difficulty");

    const difficultyBreakdown = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    submissions.forEach((submission) => {
      const difficulty = submission.question?.difficulty?.toLowerCase();
      if (difficultyBreakdown.hasOwnProperty(difficulty)) {
        difficultyBreakdown[difficulty]++;
      }
    });

    const userStats = {
      points: user.points || 0,
      streakDays: user.streakDays || 0,
      solvedQuestionsCount: submissions.length,
      difficultyBreakdown,
    };

    // Check each badge for eligibility
    const newBadges = [];
    for (const badge of allBadges) {
      if (
        !earnedBadgeIds.includes(badge._id.toString()) &&
        checkBadgeEligibility(badge, userStats)
      ) {
        // Award the badge
        await UserBadge.create({
          user: userId,
          badge: badge._id,
        });

        newBadges.push(badge);
        console.log(`🏆 Badge awarded: ${badge.name} to user ${userId}`);
      }
    }

    return newBadges;
  } catch (error) {
    console.error("Error checking and awarding badges:", error);
    return [];
  }
};

// Google Authentication
export const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        username: name,
        email,
        password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for Google users
        role: "candidate", // Default role
        googleId,
        profilePicture: picture,
        badges: ["Welcome"], // Give a welcome badge
      });
    } else {
      // Update existing user with Google ID if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = picture;
        await user.save();
      }
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Google authentication successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
      token,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid Google token",
    });
  }
});
