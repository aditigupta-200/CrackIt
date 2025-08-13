import React, { useEffect, useState } from "react";
import {
  updateProfile,
  getUserProgress,
  getUserProfile,
  getDashboardStats,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Mail,
  Save,
  Edit2,
  Trophy,
  Target,
  Zap,
  Shield,
  Users,
  Activity,
  Code,
  Calendar,
  Settings,
} from "lucide-react";
import Navbar from "../components/Navbar";

const Profile = () => {
  const { user, loginUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState({
    points: 0,
    badges: [],
    nextBadge: null,
    streakDays: 0,
    solvedQuestionsCount: 0,
    mediumQuestionsSolved: 0,
    hardQuestionsSolved: 0,
  });
  const [profileData, setProfileData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [adminStats, setAdminStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === "super_admin") {
          // Fetch admin-specific data
          const [profileRes, statsRes] = await Promise.all([
            getUserProfile(),
            getDashboardStats(),
          ]);
          setProfileData(profileRes.data);
          setAdminStats(statsRes.data);
        } else {
          // Fetch regular user data
          const [progressRes, profileRes] = await Promise.all([
            getUserProgress(),
            getUserProfile(),
          ]);
          setProgress(progressRes.data);
          setProfileData(profileRes.data);
          setSubmissions(profileRes.data.submissions || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await updateProfile(formData);

      // Update user context with new data
      const updatedUser = { ...user, ...formData };
      loginUser(updatedUser, localStorage.getItem("token"));

      setIsEditing(false);
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error updating profile");
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
    });
    setIsEditing(false);
    setMessage("");
  };

  const getBadgeColor = (index) => {
    const colors = [
      "bg-yellow-100 text-yellow-800 border-yellow-200",
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-red-100 text-red-800 border-red-200",
    ];
    return colors[index % colors.length];
  };

  const currentUser = profileData?.user || user;

  // Super Admin Profile View
  if (user?.role === "super_admin") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-3xl font-bold mb-6">Super Admin Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                  {/* Profile Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-red-100 p-4 rounded-full">
                        <Shield size={32} className="text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">
                          {currentUser?.username}
                        </h2>
                        <p className="text-red-600 font-medium">
                          Super Administrator
                        </p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Settings size={16} className="mr-1" />
                          Full Platform Access
                        </div>
                      </div>
                    </div>

                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Edit2 size={16} className="mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {/* Success/Error Message */}
                  {message && (
                    <div
                      className={`p-3 rounded-lg mb-4 ${
                        message.includes("successfully")
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  {/* Profile Form */}
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                          <User size={16} className="inline mr-2" />
                          Username
                        </label>
                        <input
                          type="text"
                          className={`w-full p-3 border rounded-lg ${
                            isEditing
                              ? "bg-white border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                              : "bg-gray-50 border-gray-200"
                          } transition-colors`}
                          value={formData.username}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              username: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                          <Mail size={16} className="inline mr-2" />
                          Email
                        </label>
                        <input
                          type="email"
                          className={`w-full p-3 border rounded-lg ${
                            isEditing
                              ? "bg-white border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                              : "bg-gray-50 border-gray-200"
                          } transition-colors`}
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          disabled={!isEditing}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                          Administrative Role
                        </label>
                        <div className="flex items-center p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                          <Shield size={20} className="text-red-600 mr-2" />
                          <span className="text-red-700 font-medium">
                            Super Administrator
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          You have complete administrative control over the
                          platform, including user management, role assignments,
                          and system restrictions.
                        </p>
                      </div>
                    </div>

                    {/* Form Actions */}
                    {isEditing && (
                      <div className="flex justify-end space-x-4 mt-6">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                        >
                          <Save size={16} className="mr-2" />
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                {/* Admin Privileges */}
                <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Settings size={20} className="mr-2 text-red-600" />
                    Administrative Privileges
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <Users size={18} className="text-green-600 mr-3" />
                      <div>
                        <div className="font-semibold text-green-800">
                          User Management
                        </div>
                        <div className="text-sm text-green-600">
                          Create, edit, and manage all users
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Shield size={18} className="text-blue-600 mr-3" />
                      <div>
                        <div className="font-semibold text-blue-800">
                          Role Assignment
                        </div>
                        <div className="text-sm text-blue-600">
                          Modify user roles and permissions
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <Activity size={18} className="text-purple-600 mr-3" />
                      <div>
                        <div className="font-semibold text-purple-800">
                          Activity Monitor
                        </div>
                        <div className="text-sm text-purple-600">
                          View all user activities and submissions
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <Settings size={18} className="text-orange-600 mr-3" />
                      <div>
                        <div className="font-semibold text-orange-800">
                          System Control
                        </div>
                        <div className="text-sm text-orange-600">
                          Restrict users and manage platform features
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Account Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">
                        Administrator since:
                      </span>
                      <span className="font-medium">
                        {new Date(currentUser?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Last login:</span>
                      <span className="font-medium">
                        {currentUser?.lastLogin
                          ? new Date(currentUser.lastLogin).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Access Level:</span>
                      <span className="font-medium text-red-600">Maximum</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Account ID:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {currentUser?._id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Platform Stats */}
              <div className="space-y-6">
                {adminStats && (
                  <>
                    {/* Platform Overview */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center">
                        <Activity size={20} className="mr-2 text-blue-600" />
                        Platform Overview
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center">
                            <Users className="text-blue-600 mr-2" size={20} />
                            <span className="text-gray-700">Total Users</span>
                          </div>
                          <span className="text-xl font-bold text-blue-600">
                            {adminStats.users?.total || 0}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center">
                            <Code className="text-green-600 mr-2" size={20} />
                            <span className="text-gray-700">
                              Total Submissions
                            </span>
                          </div>
                          <span className="text-xl font-bold text-green-600">
                            {adminStats.submissions?.total || 0}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center">
                            <Calendar
                              className="text-purple-600 mr-2"
                              size={20}
                            />
                            <span className="text-gray-700">
                              Total Interviews
                            </span>
                          </div>
                          <span className="text-xl font-bold text-purple-600">
                            {adminStats.interviews?.total || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* User Distribution */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                      <h3 className="text-lg font-bold mb-3">User Roles</h3>
                      <div className="space-y-3">
                        {Object.entries(adminStats.users?.byRole || {}).map(
                          ([role, count]) => (
                            <div
                              key={role}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                <div
                                  className={`w-3 h-3 rounded-full mr-3 ${
                                    role === "super_admin"
                                      ? "bg-red-500"
                                      : role === "interviewer"
                                      ? "bg-blue-500"
                                      : "bg-green-500"
                                  }`}
                                ></div>
                                <span className="text-gray-700 capitalize">
                                  {role.replace("_", " ")}
                                </span>
                              </div>
                              <span className="font-semibold">{count}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Recent Activity Summary */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                      <h3 className="text-lg font-bold mb-3">
                        Recent Activity
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Last 7 days:</span>
                          <span className="font-medium">
                            {adminStats.submissions?.recent || 0} submissions
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Success Rate:</span>
                          <span className="font-medium text-green-600">
                            {adminStats.submissions?.successRate || 0}%
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">
                            Completed Interviews:
                          </span>
                          <span className="font-medium">
                            {adminStats.interviews?.completed || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Regular User Profile View (existing code)
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                {/* Profile Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-4 rounded-full">
                      <User size={32} className="text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {currentUser?.username}
                      </h2>
                      <p className="text-gray-600 capitalize">
                        {currentUser?.role?.replace("_", " ")}
                      </p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Trophy size={16} className="mr-1" />
                        {progress.points} points
                      </div>
                    </div>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      <Edit2 size={16} className="mr-2" />
                      Edit Profile
                    </button>
                  )}
                </div>

                {/* Success/Error Message */}
                {message && (
                  <div
                    className={`p-3 rounded mb-4 ${
                      message.includes("successfully")
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-red-100 text-red-700 border border-red-300"
                    }`}
                  >
                    {message}
                  </div>
                )}

                {/* Profile Form */}
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        <User size={16} className="inline mr-2" />
                        Username
                      </label>
                      <input
                        type="text"
                        className={`w-full p-3 border rounded ${
                          isEditing ? "bg-white" : "bg-gray-50"
                        }`}
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        disabled={!isEditing}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        <Mail size={16} className="inline mr-2" />
                        Email
                      </label>
                      <input
                        type="email"
                        className={`w-full p-3 border rounded ${
                          isEditing ? "bg-white" : "bg-gray-50"
                        }`}
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={!isEditing}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Role</label>
                      <input
                        type="text"
                        className="w-full p-3 border rounded bg-gray-50 capitalize"
                        value={currentUser?.role?.replace("_", " ")}
                        disabled
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Role cannot be changed. Contact admin if needed.
                      </p>
                    </div>
                  </div>

                  {/* Form Actions */}
                  {isEditing && (
                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        <Save size={16} className="mr-2" />
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Account Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Account Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Member since:</span>
                    <span>
                      {new Date(currentUser?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Last active:</span>
                    <span>
                      {currentUser?.streak?.lastActiveDate
                        ? new Date(
                            currentUser.streak.lastActiveDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Account ID:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {currentUser?._id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Progress */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <div className="flex items-center">
                      <Target className="text-blue-600 mr-2" size={20} />
                      <span className="text-gray-700">Problems Solved</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">
                      {progress.solvedQuestionsCount || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <div className="flex items-center">
                      <Zap className="text-green-600 mr-2" size={20} />
                      <span className="text-gray-700">Current Streak</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      {progress.streakDays || 0} days
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                    <div className="flex items-center">
                      <Trophy className="text-yellow-600 mr-2" size={20} />
                      <span className="text-gray-700">Total Points</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-600">
                      {progress.points || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress to Next Badge */}
              {progress.nextBadge && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold mb-3">Next Badge</h3>
                  <div className="text-center">
                    <div className="mb-2">
                      <div className="text-lg font-semibold">
                        {progress.nextBadge.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {progress.nextBadge.description}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (progress.points /
                              progress.nextBadge.requiredPoints) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {progress.points} / {progress.nextBadge.requiredPoints}{" "}
                      points
                    </div>
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">
                  Badges ({progress.badges.filter((b) => b.earned).length})
                </h3>
                <div className="space-y-3">
                  {progress.badges.map((badge, index) => (
                    <div
                      key={badge._id}
                      className={`p-3 rounded-lg border-2 ${
                        badge.earned
                          ? getBadgeColor(index)
                          : "bg-gray-50 text-gray-400 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">
                            {badge.name}
                          </div>
                          <div className="text-xs opacity-75">
                            {badge.description}
                          </div>
                        </div>
                        <div className="text-xs">
                          {badge.requiredPoints} pts
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Recent Submissions</h3>
            {submissions.length > 0 ? (
              <div className="space-y-3">
                {submissions.map((submission) => (
                  <div
                    key={submission._id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {submission.questionTitle}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                submission.status === "Accepted"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            ></span>
                            {submission.status}
                          </span>
                          <span>{submission.language}</span>
                          <span>
                            {submission.testCasesPassed}/
                            {submission.testCasesTotal} tests passed
                          </span>
                          {submission.pointsEarned > 0 && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              +{submission.pointsEarned} pts
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(submission.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target size={48} className="mx-auto mb-3 opacity-50" />
                <p>No submissions yet</p>
                <p className="text-sm">
                  Start solving problems to see your progress here!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
