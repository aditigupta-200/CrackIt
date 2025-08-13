import User from "../models/User.js";
import Submission from "../models/Submission.js";
import Interview from "../models/Interview.js";
import Application from "../models/Application.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, "Email already in use");

  const hashed = await bcrypt.hash(password, 10);
  const admin = await User.create({
    username: name,
    email,
    password: hashed,
    role: "super_admin",
  });

  res.status(201).json({ message: "Admin created", admin });
});

export const getUserDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password");
  if (!user) throw new ApiError(404, "User not found");

  // Get user submissions
  const submissions = await Submission.find({ user: userId })
    .populate("question", "title difficulty")
    .sort({ createdAt: -1 })
    .limit(10);

  // Get user interviews (if interviewer)
  let interviews = [];
  if (user.role === "interviewer") {
    interviews = await Interview.find({ interviewer: userId })
      .populate("selectedCandidate", "username email")
      .sort({ createdAt: -1 });
  }

  // Get user applications (if candidate)
  let applications = [];
  if (user.role === "candidate") {
    applications = await Interview.find({ candidatesApplied: userId })
      .populate("interviewer", "username email")
      .select("title scheduledTime status")
      .sort({ createdAt: -1 });
  }

  // Calculate activity stats
  const totalSubmissions = await Submission.countDocuments({ user: userId });
  const acceptedSubmissions = await Submission.countDocuments({
    user: userId,
    status: "Accepted",
  });

  const activityData = {
    totalSubmissions,
    acceptedSubmissions,
    successRate:
      totalSubmissions > 0
        ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)
        : 0,
    interviews: interviews.length,
    applications: applications.length,
  };

  res.json({
    user,
    submissions,
    interviews,
    applications,
    activityData,
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["candidate", "interviewer", "super_admin"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select("-password");

  if (!user) throw new ApiError(404, "User not found");

  res.json({ message: "User role updated successfully", user });
});

export const restrictUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { restrictions } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        restrictions: restrictions,
        restrictedAt: new Date(),
      },
    },
    { new: true }
  ).select("-password");

  if (!user) throw new ApiError(404, "User not found");

  res.json({ message: "User restrictions updated successfully", user });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  // Get user counts by role
  const userStats = await User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  // Get total submissions
  const totalSubmissions = await Submission.countDocuments();
  const acceptedSubmissions = await Submission.countDocuments({
    status: "Accepted",
  });

  // Get total interviews
  const totalInterviews = await Interview.countDocuments();
  const completedInterviews = await Interview.countDocuments({
    status: "completed",
  });

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSubmissions = await Submission.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  // Get most active users
  const activeUsers = await Submission.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: "$user",
        submissionCount: { $sum: 1 },
      },
    },
    { $sort: { submissionCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $project: {
        username: { $arrayElemAt: ["$userInfo.username", 0] },
        email: { $arrayElemAt: ["$userInfo.email", 0] },
        role: { $arrayElemAt: ["$userInfo.role", 0] },
        submissionCount: 1,
      },
    },
  ]);

  const stats = {
    users: {
      total: userStats.reduce((sum, stat) => sum + stat.count, 0),
      byRole: userStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
    },
    submissions: {
      total: totalSubmissions,
      accepted: acceptedSubmissions,
      recent: recentSubmissions,
      successRate:
        totalSubmissions > 0
          ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)
          : 0,
    },
    interviews: {
      total: totalInterviews,
      completed: completedInterviews,
    },
    activeUsers,
  };

  res.json(stats);
});

// Improved getUserActivities with better user-wise formatting
export const getUserActivities = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, activity } = req.query;

  // Get activities grouped by user
  const userActivities = await User.aggregate([
    // Filter by role if specified
    ...(role ? [{ $match: { role } }] : []),

    // Get user submissions
    {
      $lookup: {
        from: "submissions",
        localField: "_id",
        foreignField: "user",
        as: "submissions",
        pipeline: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "dsaquestions",
              localField: "question",
              foreignField: "_id",
              as: "questionDetails",
            },
          },
          {
            $project: {
              status: 1,
              pointsEarned: 1,
              createdAt: 1,
              language: 1,
              question: { $arrayElemAt: ["$questionDetails", 0] },
            },
          },
        ],
      },
    },

    // Get interviews created by user (if interviewer)
    {
      $lookup: {
        from: "interviews",
        localField: "_id",
        foreignField: "interviewer",
        as: "interviewsCreated",
        pipeline: [
          { $sort: { createdAt: -1 } },
          { $limit: 3 },
          {
            $lookup: {
              from: "users",
              localField: "selectedCandidate",
              foreignField: "_id",
              as: "candidateDetails",
            },
          },
          {
            $project: {
              title: 1,
              status: 1,
              scheduledTime: 1,
              createdAt: 1,
              candidateCount: { $size: "$candidatesApplied" },
              selectedCandidate: {
                $arrayElemAt: ["$candidateDetails.username", 0],
              },
            },
          },
        ],
      },
    },

    // Get interviews applied by user (if candidate)
    {
      $lookup: {
        from: "interviews",
        localField: "_id",
        foreignField: "candidatesApplied",
        as: "interviewsApplied",
        pipeline: [
          { $sort: { createdAt: -1 } },
          { $limit: 3 },
          {
            $lookup: {
              from: "users",
              localField: "interviewer",
              foreignField: "_id",
              as: "interviewerDetails",
            },
          },
          {
            $project: {
              title: 1,
              status: 1,
              scheduledTime: 1,
              createdAt: 1,
              interviewer: {
                $arrayElemAt: ["$interviewerDetails.username", 0],
              },
            },
          },
        ],
      },
    },

    // Calculate activity metrics
    {
      $addFields: {
        totalSubmissions: { $size: "$submissions" },
        totalInterviewsCreated: { $size: "$interviewsCreated" },
        totalInterviewsApplied: { $size: "$interviewsApplied" },
        acceptedSubmissions: {
          $size: {
            $filter: {
              input: "$submissions",
              cond: { $eq: ["$$this.status", "Accepted"] },
            },
          },
        },
        lastActivity: {
          $max: [
            { $ifNull: [{ $max: "$submissions.createdAt" }, new Date(0)] },
            {
              $ifNull: [{ $max: "$interviewsCreated.createdAt" }, new Date(0)],
            },
            {
              $ifNull: [{ $max: "$interviewsApplied.createdAt" }, new Date(0)],
            },
          ],
        },
      },
    },

    // Add success rate calculation
    {
      $addFields: {
        successRate: {
          $cond: {
            if: { $gt: ["$totalSubmissions", 0] },
            then: {
              $multiply: [
                { $divide: ["$acceptedSubmissions", "$totalSubmissions"] },
                100,
              ],
            },
            else: 0,
          },
        },
        totalActivity: {
          $add: [
            "$totalSubmissions",
            "$totalInterviewsCreated",
            "$totalInterviewsApplied",
          ],
        },
      },
    },

    // Filter out users with no activity if specified
    ...(activity === "active"
      ? [{ $match: { totalActivity: { $gt: 0 } } }]
      : []),

    // Sort by last activity
    { $sort: { lastActivity: -1 } },

    // Pagination
    { $skip: (parseInt(page) - 1) * parseInt(limit) },
    { $limit: parseInt(limit) },

    // Final projection
    {
      $project: {
        username: 1,
        email: 1,
        role: 1,
        createdAt: 1,
        restrictions: 1,
        totalSubmissions: 1,
        acceptedSubmissions: 1,
        successRate: { $round: ["$successRate", 1] },
        totalInterviewsCreated: 1,
        totalInterviewsApplied: 1,
        lastActivity: 1,
        totalActivity: 1,
        recentSubmissions: { $slice: ["$submissions", 3] },
        recentInterviewsCreated: { $slice: ["$interviewsCreated", 2] },
        recentInterviewsApplied: { $slice: ["$interviewsApplied", 2] },
      },
    },
  ]);

  res.json({
    activities: userActivities,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: userActivities.length,
    },
  });
});
