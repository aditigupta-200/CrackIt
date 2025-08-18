import React, { useState, useEffect } from "react";
import { getUserBadges, getAllBadges, createBadge, createBadgeTest, debugCurrentUser } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Award, Plus, X, Star, Lock, Check, User } from "lucide-react";
import Navbar from "../components/Navbar";

const Badges = () => {
  const { user } = useAuth();
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBadge, setNewBadge] = useState({
    name: "",
    description: "",
    requiredPoints: 0,
    criteria: {
      type: "points",
      value: 100,
      operator: "greater_equal",
    },
    icon: "🏆",
    color: "#FFD700",
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const [allBadgesResponse, userBadgesResponse] = await Promise.all([
        getAllBadges(),
        getUserBadges(),
      ]);
      
      setAllBadges(allBadgesResponse.data.data || allBadgesResponse.data);
      setUserBadges(userBadgesResponse.data.data || userBadgesResponse.data);
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBadge = async (e) => {
    e.preventDefault();
    try {
      // Use test endpoint if not super_admin, regular endpoint if super_admin
      if (user?.role === "super_admin") {
        await createBadge(newBadge);
      } else {
        console.log("Using test endpoint for non-super_admin user");
        await createBadgeTest(newBadge);
      }
      setShowCreateForm(false);
      setNewBadge({
        name: "",
        description: "",
        requiredPoints: 0,
        criteria: {
          type: "points",
          value: 100,
          operator: "greater_equal",
        },
        icon: "🏆",
        color: "#FFD700",
      });
      fetchBadges();
    } catch (error) {
      console.error("Error creating badge:", error);
      alert(`Failed to create badge: ${error.response?.data?.message || error.message}`);
    }
  };

  const isBadgeEarned = (badgeId) => {
    return userBadges.some(ub => ub.badge?._id === badgeId);
  };

  const getEarnedBadge = (badgeId) => {
    return userBadges.find(ub => ub.badge?._id === badgeId);
  };

  const getCriteriaDescription = (criteria) => {
    const { type, value } = criteria;
    
    switch (type) {
      case "difficulty":
        return `Solve your first ${value} problem`;
      case "streak":
        return `Maintain a ${value}-day solving streak`;
      case "total_problems":
        return `Solve ${value} problems in total`;
      case "points":
        return `Earn ${value} points`;
      default:
        return criteria.description || "Complete the specified task";
    }
  };

  const handleDebugUser = async () => {
    try {
      const response = await debugCurrentUser();
      alert(`User Role: ${response.data.user.role}\nUsername: ${response.data.user.username}\nEmail: ${response.data.user.email}`);
    } catch (error) {
      alert(`Debug Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Badges & Achievements</h1>
            <div className="flex items-center gap-3">
              {/* User Role Debug Info */}
              <div className="text-sm bg-white px-3 py-2 rounded-lg shadow-sm border">
                <span className="text-gray-600">Role:</span>{" "}
                <span className={`font-semibold ${
                  user?.role === "super_admin" ? "text-green-600" : 
                  user?.role === "interviewer" ? "text-blue-600" : 
                  "text-gray-600"
                }`}>
                  {user?.role || 'Not logged in'}
                </span>
              </div>
              
              <button
                onClick={handleDebugUser}
                className="flex items-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                <User size={16} className="mr-2" />
                Debug Role
              </button>
              {user && ( // Show create button for any authenticated user (for testing)
                <button
                  onClick={() => setShowCreateForm(true)}
                  className={`flex items-center px-4 py-2 rounded text-white ${
                    user?.role === "super_admin" 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  <Plus size={16} className="mr-2" />
                  {user?.role === "super_admin" ? "Create Badge" : "Test Create Badge"}
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading badges...</p>
            </div>
          ) : allBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allBadges.map((badge) => {
                const earnedBadge = getEarnedBadge(badge._id);
                const isEarned = isBadgeEarned(badge._id);
                
                return (
                  <div
                    key={badge._id}
                    className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                      isEarned ? 'ring-2 ring-yellow-400' : 'opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className={`p-3 rounded-full text-2xl flex items-center justify-center w-12 h-12`}
                        style={{ backgroundColor: badge.color + '20', color: badge.color }}
                      >
                        {badge.icon || '🏆'}
                      </div>
                      <div className="flex items-center">
                        {isEarned ? (
                          <div className="flex items-center text-green-500">
                            <Check size={16} className="mr-1" />
                            <span className="text-sm font-semibold">Earned</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <Lock size={16} className="mr-1" />
                            <span className="text-sm">Locked</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className={`text-xl font-bold mb-2 ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
                      {badge.name}
                    </h3>

                    <p className={`mb-3 ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
                      {badge.description || getCriteriaDescription(badge.criteria)}
                    </p>

                    <div className={`bg-gray-50 p-3 rounded mb-3 ${isEarned ? '' : 'opacity-60'}`}>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Criteria: </span>
                        {getCriteriaDescription(badge.criteria)}
                      </p>
                    </div>

                    {isEarned && earnedBadge?.awardedAt && (
                      <div className="text-sm text-green-600 font-medium">
                        ✅ Earned on{" "}
                        {new Date(earnedBadge.awardedAt).toLocaleDateString()}
                      </div>
                    )}

                    {badge.requiredPoints > 0 && (
                      <div className="mt-3 flex items-center text-yellow-500">
                        <Star size={16} className="mr-1" />
                        <span className="text-sm">{badge.requiredPoints} pts</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg mb-2">No badges available</p>
              <p className="text-gray-400">
                {user?.role === "super_admin" 
                  ? "Create badges to get started!" 
                  : "Check back later for new badges!"
                }
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
                  {userBadges.length}
                </div>
                <div className="text-yellow-600">Badges Earned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Badge Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full p-2 border rounded h-24"
                    value={newBadge.description}
                    onChange={(e) =>
                      setNewBadge({ ...newBadge, description: e.target.value })
                    }
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Icon (emoji)</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newBadge.icon}
                    onChange={(e) =>
                      setNewBadge({ ...newBadge, icon: e.target.value })
                    }
                    placeholder="🏆"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Color (hex)</label>
                  <input
                    type="color"
                    className="w-full p-1 border rounded h-10"
                    value={newBadge.color}
                    onChange={(e) =>
                      setNewBadge({ ...newBadge, color: e.target.value })
                    }
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Criteria Type</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={newBadge.criteria.type}
                    onChange={(e) =>
                      setNewBadge({
                        ...newBadge,
                        criteria: { ...newBadge.criteria, type: e.target.value }
                      })
                    }
                  >
                    <option value="points">Points</option>
                    <option value="total_problems">Total Problems</option>
                    <option value="difficulty">Difficulty</option>
                    <option value="streak">Streak Days</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    {newBadge.criteria.type === "difficulty" ? "Difficulty" : "Value"}
                  </label>
                  {newBadge.criteria.type === "difficulty" ? (
                    <select
                      className="w-full p-2 border rounded"
                      value={newBadge.criteria.value}
                      onChange={(e) =>
                        setNewBadge({
                          ...newBadge,
                          criteria: { ...newBadge.criteria, value: e.target.value }
                        })
                      }
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  ) : (
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={newBadge.criteria.value}
                      onChange={(e) =>
                        setNewBadge({
                          ...newBadge,
                          criteria: { ...newBadge.criteria, value: parseInt(e.target.value) }
                        })
                      }
                      required
                    />
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Required Points (optional)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={newBadge.requiredPoints}
                    onChange={(e) =>
                      setNewBadge({
                        ...newBadge,
                        requiredPoints: parseInt(e.target.value) || 0,
                      })
                    }
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
