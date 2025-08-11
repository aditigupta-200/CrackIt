import React, { useEffect, useState } from "react";
import {
  updateProfile,
  getUserProgress,
  getUserProfile,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { User, Mail, Save, Edit2, Trophy, Target, Zap } from "lucide-react";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, profileRes] = await Promise.all([
          getUserProgress(),
          getUserProfile(),
        ]);

        setProgress(progressRes.data);
        setProfileData(profileRes.data);
        setSubmissions(profileRes.data.submissions || []);

        console.log("Progress data:", progressRes.data);
        console.log("Profile data:", profileRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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