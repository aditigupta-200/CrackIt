import React, { useState } from "react";
import { updateProfile } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { User, Mail, Save, Edit2 } from "lucide-react";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await updateProfile(formData);

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>

          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Profile Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-4 rounded-full">
                  <User size={32} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user?.username}</h2>
                  <p className="text-gray-600 capitalize">
                    {user?.role?.replace("_", " ")}
                  </p>
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
                    value={user?.role?.replace("_", " ")}
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

          {/* User Stats */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">
                  {user?.questionsSolved || 0}
                </div>
                <div className="text-blue-600">Problems Solved</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {user?.streak?.daily || 0}
                </div>
                <div className="text-green-600">Current Streak</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded">
                <div className="text-2xl font-bold text-purple-600">
                  {user?.badges?.length || 0}
                </div>
                <div className="text-purple-600">Badges Earned</div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Member since:</span>
                <span>{new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last active:</span>
                <span>
                  {user?.streak?.lastActiveDate
                    ? new Date(user.streak.lastActiveDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account ID:</span>
                <span className="font-mono text-xs">{user?._id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
