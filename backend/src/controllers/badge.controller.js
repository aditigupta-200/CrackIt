//badge.controller.js
import Badge from "../models/Badge.js";
import UserBadge from "../models/UserBadge.js";
import User from "../models/User.js";

export const createBadge = async (req, res) => {
  try {
    const badge = await Badge.create({ ...req.body, createdBy: req.user._id });
    res.json(badge);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserBadges = async (req, res) => {
  try {
    const badges = await UserBadge.find({ user: req.user._id }).populate(
      "badge"
    );
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find({}).sort({ requiredPoints: 1 });
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserBadges = async (userId, pointsEarned) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      console.error("User not found for badge update:", userId);
      return { points: 0, badges: [], newBadges: [] };
    }

    // Update user points
    const oldPoints = user.points;
    user.points += pointsEarned;

    console.log(
      `User ${userId} points updated: ${oldPoints} -> ${user.points}`
    );

    // Get all badges that the user should have based on their points
    const availableBadges = await Badge.find({
      requiredPoints: { $lte: user.points },
    }).sort({ requiredPoints: 1 });

    // Get badges the user already has
    const existingUserBadges = await UserBadge.find({ user: userId });
    const existingBadgeIds = existingUserBadges.map((ub) =>
      ub.badge.toString()
    );

    // Find new badges to award
    const newBadges = [];
    const badgesToAward = availableBadges.filter(
      (badge) => !existingBadgeIds.includes(badge._id.toString())
    );

    // Award new badges
    for (const badge of badgesToAward) {
      try {
        const newUserBadge = await UserBadge.create({
          user: userId,
          badge: badge._id,
          awardedAt: new Date(),
        });

        await newUserBadge.populate("badge");
        newBadges.push(newUserBadge);

        // Update user's badges array (for backward compatibility)
        if (!user.badges.includes(badge.name)) {
          user.badges.push(badge.name);
        }

        console.log(
          `Badge awarded to user ${userId}: ${badge.name} (${badge.requiredPoints} points required)`
        );
      } catch (error) {
        console.error(
          `Error awarding badge ${badge.name} to user ${userId}:`,
          error
        );
      }
    }

    // Save user with updated points and badges
    await user.save();

    // Get updated user badges for response
    const updatedUserBadges = await UserBadge.find({ user: userId }).populate(
      "badge"
    );

    return {
      points: user.points,
      badges: user.badges,
      newBadges: newBadges,
      totalBadges: updatedUserBadges.length,
      userBadges: updatedUserBadges,
    };
  } catch (error) {
    console.error("Error updating user badges:", error);
    return { points: 0, badges: [], newBadges: [], error: error.message };
  }
};

// Function to check and award badges for existing users
export const checkUserBadges = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await updateUserBadges(userId, 0); // Check without adding points
    res.json({
      message: "Badges checked successfully",
      ...result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to get user progress including badges
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user badges
    const userBadges = await UserBadge.find({ user: userId }).populate("badge");

    // Get all available badges to find next badge
    const allBadges = await Badge.find({}).sort({ requiredPoints: 1 });
    const nextBadge = allBadges.find(
      (badge) => badge.requiredPoints > user.points
    );

    // Calculate streak days (simplified)
    const streakDays = user.streak?.daily || 0;

    res.json({
      points: user.points,
      badges: userBadges,
      nextBadge: nextBadge,
      streakDays: streakDays,
      questionsSolved: user.questionsSolved,
      totalBadgesAvailable: allBadges.length,
      badgesEarned: userBadges.length,
      submissions: [], // Add submissions if you have a submissions collection
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ message: error.message });
  }
};

// Function to recalculate all user badges (admin function)
export const recalculateAllUserBadges = async (req, res) => {
  try {
    const users = await User.find({});
    const results = [];

    for (const user of users) {
      const result = await updateUserBadges(user._id, 0);
      results.push({
        userId: user._id,
        username: user.username,
        points: result.points,
        badgesCount: result.totalBadges,
        newBadgesAwarded: result.newBadges.length,
      });
    }

    res.json({
      message: "All user badges recalculated",
      results: results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
