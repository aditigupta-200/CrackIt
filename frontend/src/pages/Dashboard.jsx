import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getDSAQuestions,
  getInterviews,
  getUserBadges,
  getUserProgress,
} from "../services/api";
import {
  Code,
  Calendar,
  Award,
  TrendingUp,
  User,
  Target,
  Zap,
  Trophy,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    questions: 0,
    interviews: 0,
    badges: 0,
    streak: 0,
  });
  const [userProgress, setUserProgress] = useState({
    points: 0,
    solvedQuestionsCount: 0,
    streakDays: 0,
    badges: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [dsaRes, interviewsRes, badgesRes, progressRes] =
          await Promise.all([
            getDSAQuestions(),
            getInterviews(),
            getUserBadges(),
            getUserProgress(),
          ]);

        setStats({
          questions: dsaRes.data.length,
          interviews: interviewsRes.data.length,
          badges: badgesRes.data.length,
          streak: progressRes.data.streakDays || 0,
        });

        setUserProgress(progressRes.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const earnedBadges = userProgress.badges.filter((badge) => badge.earned);

  // Calculate progress based on questions solved and difficulty
  const calculateProgress = () => {
    const totalQuestions = stats.questions;
    const solvedQuestions = userProgress.solvedQuestionsCount || 0;

    if (totalQuestions === 0) return 0;

    // If we have difficulty breakdown, use weighted calculation
    if (userProgress.difficultyBreakdown) {
      const {
        easy = 0,
        medium = 0,
        hard = 0,
      } = userProgress.difficultyBreakdown;

      // Weight: Easy = 1, Medium = 2, Hard = 3
      const weightedScore = easy * 1 + medium * 2 + hard * 3;
      const maxPossibleScore = totalQuestions * 2; // Assuming average difficulty is medium

      return Math.min(
        Math.round((weightedScore / maxPossibleScore) * 100),
        100
      );
    }

    // Basic progress percentage (fallback when no difficulty breakdown available)
    const basicProgress = Math.round((solvedQuestions / totalQuestions) * 100);
    return Math.min(basicProgress, 100);
  };

  const progressPercentage = calculateProgress();

  // Calculate displayed solved questions count
  const getDisplayedSolvedCount = () => {
    return userProgress.solvedQuestionsCount || 0;
  };

  const displayedSolvedCount = getDisplayedSolvedCount();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600 mt-2">
              Role:{" "}
              <span className="capitalize font-semibold">{user?.role}</span>
            </p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Problems Solved</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {loading ? "..." : userProgress.solvedQuestionsCount || 0}
                  </p>
                </div>
                <Target className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Points</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {loading ? "..." : userProgress.points || 0}
                  </p>
                </div>
                <Trophy className="text-yellow-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Current Streak</p>
                  <p className="text-2xl font-bold text-green-600">
                    {loading ? "..." : userProgress.streakDays || 0}
                  </p>
                  <p className="text-xs text-gray-500">days</p>
                </div>
                <Zap className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Badges Earned</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {loading ? "..." : earnedBadges.length}
                  </p>
                </div>
                <Award className="text-purple-500" size={32} />
              </div>
            </div>
          </div>

          {/* Available Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Available Questions</p>
                  <p className="text-2xl font-bold">{stats.questions}</p>
                </div>
                <Code className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Open Interviews</p>
                  <p className="text-2xl font-bold">{stats.interviews}</p>
                </div>
                <Calendar className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Badges</p>
                  <p className="text-2xl font-bold">
                    {userProgress.badges.length}
                  </p>
                </div>
                <Award className="text-yellow-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Overall Progress</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {progressPercentage}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {displayedSolvedCount} / {stats.questions} problems
                  </p>
                </div>
                <TrendingUp className="text-indigo-500" size={32} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {user?.role === "candidate" && (
                  <>
                    <Link
                      to="/dsa"
                      className="block w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                    >
                      <div className="flex items-center">
                        <Code size={20} className="text-blue-600 mr-3" />
                        <div>
                          <div className="font-semibold">
                            Solve DSA Problems
                          </div>
                          <div className="text-sm text-gray-600">
                            Practice and earn points
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/interviews"
                      className="block w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded transition-colors"
                    >
                      <div className="flex items-center">
                        <Calendar size={20} className="text-green-600 mr-3" />
                        <div>
                          <div className="font-semibold">
                            Apply for Interviews
                          </div>
                          <div className="text-sm text-gray-600">
                            Find opportunities
                          </div>
                        </div>
                      </div>
                    </Link>
                  </>
                )}
                {user?.role === "interviewer" && (
                  <Link
                    to="/interviews"
                    className="block w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
                  >
                    <div className="flex items-center">
                      <Calendar size={20} className="text-purple-600 mr-3" />
                      <div>
                        <div className="font-semibold">Create Interview</div>
                        <div className="text-sm text-gray-600">
                          Schedule new interviews
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                {user?.role === "super_admin" && (
                  <>
                    <Link
                      to="/dsa"
                      className="block w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded transition-colors"
                    >
                      <div className="flex items-center">
                        <Code size={20} className="text-red-600 mr-3" />
                        <div>
                          <div className="font-semibold">Add DSA Question</div>
                          <div className="text-sm text-gray-600">
                            Create new challenges
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/admin"
                      className="block w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded transition-colors"
                    >
                      <div className="flex items-center">
                        <User size={20} className="text-orange-600 mr-3" />
                        <div>
                          <div className="font-semibold">Manage Users</div>
                          <div className="text-sm text-gray-600">
                            Admin panel
                          </div>
                        </div>
                      </div>
                    </Link>
                  </>
                )}
                <Link
                  to="/profile"
                  className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                >
                  <div className="flex items-center">
                    <User size={20} className="text-gray-600 mr-3" />
                    <div>
                      <div className="font-semibold">View Profile</div>
                      <div className="text-sm text-gray-600">
                        Check your progress
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Badges */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Recent Achievements</h3>
              {earnedBadges.length > 0 ? (
                <div className="space-y-3">
                  {earnedBadges.slice(0, 5).map((badge, index) => (
                    <div
                      key={badge._id || index}
                      className="flex items-center p-3 bg-yellow-50 rounded"
                    >
                      <Award className="text-yellow-600 mr-3" size={20} />
                      <div>
                        <div className="font-semibold text-sm">
                          {badge.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {badge.description}
                        </div>
                      </div>
                    </div>
                  ))}
                  {earnedBadges.length > 5 && (
                    <Link
                      to="/badges"
                      className="block text-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all badges →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No badges earned yet</p>
                  <p className="text-sm">
                    Start solving problems to earn your first badge!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Progress to Next Badge */}
          {userProgress.nextBadge && (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Next Goal</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">
                      {userProgress.nextBadge.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {userProgress.points} /{" "}
                      {userProgress.nextBadge.requiredPoints} points
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (userProgress.points /
                            userProgress.nextBadge.requiredPoints) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {userProgress.nextBadge.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
