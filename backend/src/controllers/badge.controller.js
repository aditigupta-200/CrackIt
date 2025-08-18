//badge.controller.js
import Badge from "../models/Badge.js";
import UserBadge from "../models/UserBadge.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

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

// Create new badge (super admin only)
export const createBadge = asyncHandler(async (req, res) => {
  const { name, description, requiredPoints, criteria, icon, color } = req.body;

  // Validate criteria structure
  const validCriteriaTypes = [
    "difficulty",
    "streak",
    "total_problems",
    "points",
    "custom",
  ];
  if (!validCriteriaTypes.includes(criteria.type)) {
    throw new ApiError(400, "Invalid criteria type");
  }

  if (
    criteria.type === "difficulty" &&
    !["easy", "medium", "hard"].includes(criteria.value)
  ) {
    throw new ApiError(
      400,
      "Invalid difficulty value. Must be easy, medium, or hard"
    );
  }

  const badge = await Badge.create({
    name,
    description,
    requiredPoints: requiredPoints || 0,
    criteria,
    icon: icon || "🏆",
    color: color || "#FFD700",
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Badge created successfully",
    data: badge,
  });
});

// Get all badges
export const getAllBadges = asyncHandler(async (req, res) => {
  const badges = await Badge.find({ isActive: true })
    .populate("createdBy", "username")
    .sort({ requiredPoints: 1 });

  res.json({
    success: true,
    data: badges,
  });
});

// Update badge (super admin only)
export const updateBadge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Validate criteria if being updated
  if (updateData.criteria) {
    const validCriteriaTypes = [
      "difficulty",
      "streak",
      "total_problems",
      "points",
      "custom",
    ];
    if (!validCriteriaTypes.includes(updateData.criteria.type)) {
      throw new ApiError(400, "Invalid criteria type");
    }

    if (
      updateData.criteria.type === "difficulty" &&
      !["easy", "medium", "hard"].includes(updateData.criteria.value)
    ) {
      throw new ApiError(
        400,
        "Invalid difficulty value. Must be easy, medium, or hard"
      );
    }
  }

  const badge = await Badge.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!badge) {
    throw new ApiError(404, "Badge not found");
  }

  res.json({
    success: true,
    message: "Badge updated successfully",
    data: badge,
  });
});

// Delete badge (super admin only) - soft delete
export const deleteBadge = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const badge = await Badge.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!badge) {
    throw new ApiError(404, "Badge not found");
  }

  res.json({
    success: true,
    message: "Badge deleted successfully",
  });
});

// Get user badges (earned badges for a specific user)
export const getUserBadges = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const userBadges = await UserBadge.find({ user: userId })
    .populate({
      path: "badge",
      match: { isActive: true },
    })
    .sort({ awardedAt: -1 });

  // Filter out badges where the badge document is null (deleted badges)
  const activeBadges = userBadges.filter((ub) => ub.badge !== null);

  res.json({
    success: true,
    data: activeBadges,
  });
});

// Award badge manually to user (super admin only)
export const awardBadgeToUser = asyncHandler(async (req, res) => {
  const { badgeId, userId } = req.body;

  // Check if badge exists
  const badge = await Badge.findById(badgeId);
  if (!badge || !badge.isActive) {
    throw new ApiError(404, "Badge not found");
  }

  // Check if user already has this badge
  const existingUserBadge = await UserBadge.findOne({
    user: userId,
    badge: badgeId,
  });

  if (existingUserBadge) {
    throw new ApiError(400, "User already has this badge");
  }

  // Award the badge
  const userBadge = await UserBadge.create({
    user: userId,
    badge: badgeId,
  });

  await userBadge.populate([
    { path: "user", select: "username email" },
    { path: "badge", select: "name description" },
  ]);

  res.status(201).json({
    success: true,
    message: "Badge awarded successfully",
    data: userBadge,
  });
});

// Get badge statistics (super admin only)
export const getBadgeStats = asyncHandler(async (req, res) => {
  const stats = await Badge.aggregate([
    {
      $lookup: {
        from: "userbadges",
        localField: "_id",
        foreignField: "badge",
        as: "awarded",
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        criteria: 1,
        isActive: 1,
        createdAt: 1,
        awardedCount: { $size: "$awarded" },
      },
    },
    {
      $sort: { awardedCount: -1 },
    },
  ]);

  res.json({
    success: true,
    data: stats,
  });
});
