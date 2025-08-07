import React, { useState, useEffect } from "react";
import { getUserBadges, createBadge } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Award, Plus, X, Star } from "lucide-react";
import Navbar from "../components/Navbar";

const Badges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBadge, setNewBadge] = useState({
    name: "",
    description: "",
    requiredPoints: 0,
    criteria: "",
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await getUserBadges();
      setBadges(response.data);
    } catch (error) {
      console.error("Error fetching badges:", error);
    }
  };

  const handleCreateBadge = async (e) => {
    e.preventDefault();
    try {
      await createBadge(newBadge);
      setShowCreateForm(false);
      setNewBadge({
        name: "",
        description: "",
        requiredPoints: 0,
        criteria: "",
      });
      fetchBadges();
    } catch (error) {
      console.error("Error creating badge:", error);
    }
  };

  const getBadgeColor = (index) => {
    const colors = [
      "bg-yellow-100 text-yellow-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-red-100 text-red-800",
      "bg-indigo-100 text-indigo-800",
    ];
    return colors[index % colors.length];
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Badges & Achievements</h1>
            {user?.role === "super_admin" && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <Plus size={16} className="mr-2" />
                Create Badge
              </button>
            )}
          </div>

          {badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((userBadge, index) => (
                <div
                  key={userBadge._id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full ${getBadgeColor(index)}`}>
                      <Award size={24} />
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star size={16} className="mr-1" />
                      <span className="text-sm">
                        {userBadge.badge?.requiredPoints || 0} pts
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2">
                    {userBadge.badge?.name}
                  </h3>

                  {userBadge.badge?.description && (
                    <p className="text-gray-600 mb-3">
                      {userBadge.badge.description}
                    </p>
                  )}

                  {userBadge.badge?.criteria && (
                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Criteria: </span>
                        {userBadge.badge.criteria}
                      </p>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Earned on{" "}
                    {new Date(userBadge.awardedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg mb-2">No badges earned yet</p>
              <p className="text-gray-400">
                Complete challenges to earn your first badge!
              </p>
            </div>
          )}

          {/* User Stats */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Your Progress</h2>
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

              <div className="text-center p-4 bg-yellow-50 rounded">
                <div className="text-2xl font-bold text-yellow-600">
                  {badges.length}
                </div>
                <div className="text-yellow-600">Badges Earned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Badge Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create Badge</h2>
                <button onClick={() => setShowCreateForm(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateBadge}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Badge Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newBadge.name}
                    onChange={(e) =>
                      setNewBadge({ ...newBadge, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full p-2 border rounded h-24"
                    value={newBadge.description}
                    onChange={(e) =>
                      setNewBadge({ ...newBadge, description: e.target.value })
                    }
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Required Points
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={newBadge.requiredPoints}
                    onChange={(e) =>
                      setNewBadge({
                        ...newBadge,
                        requiredPoints: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Criteria</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newBadge.criteria}
                    onChange={(e) =>
                      setNewBadge({ ...newBadge, criteria: e.target.value })
                    }
                    placeholder="e.g., Solve 50 DSA problems"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create Badge
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Badges;
