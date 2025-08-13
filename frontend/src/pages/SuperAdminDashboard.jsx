import React, { useState, useEffect, useCallback } from "react";
import {
  getDashboardStats,
  getAllUsers,
  getUserActivities,
  getUserDetails,
  updateUserRole,
  restrictUser,
} from "../services/api";
import {
  Users,
  UserPlus,
  X,
  Shield,
  Activity,
  TrendingUp,
  Eye,
  Edit,
  Lock,
  Unlock,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  Code,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRestrictModal, setShowRestrictModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    role: "",
    activity: "",
    search: "",
  });

  const [restrictionForm, setRestrictionForm] = useState({
    canSubmitCode: true,
    canApplyForInterviews: true,
    canCreateInterviews: true,
    canViewBadges: true,
    restrictionReason: "",
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Starting to fetch dashboard data...");

      const [statsRes, usersRes, activitiesRes] = await Promise.all([
        getDashboardStats(),
        getAllUsers(),
        getUserActivities({
          page: 1,
          limit: 20,
          role: filters.role,
          activity: filters.activity,
          search: filters.search,
        }),
      ]);

      console.log("Dashboard data received:", {
        statsRes,
        usersRes,
        activitiesRes,
      });

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setActivities(activitiesRes.data.activities || activitiesRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      console.error("Error details:", error.response?.data);
      alert(
        `Error fetching data: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  }, [filters.role, filters.activity, filters.search]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleViewUser = async (user) => {
    try {
      setSelectedUser(user);
      const response = await getUserDetails(user._id);
      setUserDetails(response.data);
      setShowUserModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      fetchDashboardData();
      setShowUserModal(false);
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleRestrictUser = async (e) => {
    e.preventDefault();
    try {
      await restrictUser(selectedUser._id, restrictionForm);
      fetchDashboardData();
      setShowRestrictModal(false);
      setShowUserModal(false);
    } catch (error) {
      console.error("Error restricting user:", error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "super_admin":
        return "text-red-600 bg-red-100 border-red-200";
      case "interviewer":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "candidate":
        return "text-green-600 bg-green-100 border-green-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="text-green-500" size={16} />;
      case "Wrong Answer":
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <AlertTriangle className="text-yellow-500" size={16} />;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesSearch =
      !filters.search ||
      user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredActivities = activities.filter((user) => {
    const matchesSearch =
      !filters.search ||
      user.username?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
      <Navbar />
      {loading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Super Admin Dashboard
                  </h1>
                  <p className="text-gray-600">
                    Comprehensive platform management and oversight
                  </p>
                </div>
              </div>
            </div>
          </div>{" "}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
              {[
                { id: "overview", label: "Overview", icon: TrendingUp },
                { id: "users", label: "User Management", icon: Users },
                { id: "activities", label: "Activities", icon: Activity },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <tab.icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && stats && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stats.users.total}
                        </p>
                      </div>
                      <Users className="text-blue-500" size={32} />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">
                          Total Submissions
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stats.submissions.total}
                        </p>
                        <p className="text-green-600 text-sm">
                          {stats.submissions.successRate}% success rate
                        </p>
                      </div>
                      <Code className="text-green-500" size={32} />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">
                          Total Interviews
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stats.interviews.total}
                        </p>
                        <p className="text-blue-600 text-sm">
                          {stats.interviews.completed} completed
                        </p>
                      </div>
                      <Calendar className="text-purple-500" size={32} />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Recent Activity</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stats.submissions.recent}
                        </p>
                        <p className="text-gray-600 text-sm">Last 7 days</p>
                      </div>
                      <Activity className="text-orange-500" size={32} />
                    </div>
                  </div>
                </div>

                {/* Role Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">
                      User Distribution
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(stats.users.byRole).map(
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

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">
                      Most Active Users
                    </h3>
                    <div className="space-y-3">
                      {stats.activeUsers.map((user, index) => (
                        <div
                          key={user._id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-semibold">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {user.username}
                              </p>
                              <p className="text-sm text-gray-500">
                                {user.role}
                              </p>
                            </div>
                          </div>
                          <span className="text-blue-600 font-semibold">
                            {user.submissionCount} submissions
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={filters.search}
                          onChange={(e) =>
                            setFilters({ ...filters, search: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.role}
                      onChange={(e) =>
                        setFilters({ ...filters, role: e.target.value })
                      }
                    >
                      <option value="">All Roles</option>
                      <option value="candidate">Candidate</option>
                      <option value="interviewer">Interviewer</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">User Management</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Activity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {user.username}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(
                                  user.role
                                )}`}
                              >
                                {user.role.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div>
                                  {user.questionsSolved || 0} problems solved
                                </div>
                                <div className="text-gray-500">
                                  {user.points || 0} points
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.restrictions?.restrictionReason ? (
                                <span className="inline-flex items-center text-red-600 text-sm">
                                  <Lock size={14} className="mr-1" />
                                  Restricted
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-green-600 text-sm">
                                  <CheckCircle size={14} className="mr-1" />
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewUser(user)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Eye size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === "activities" && (
              <div className="space-y-6">
                {/* Filter Controls */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={filters.search}
                          onChange={(e) =>
                            setFilters({ ...filters, search: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.role}
                      onChange={(e) =>
                        setFilters({ ...filters, role: e.target.value })
                      }
                    >
                      <option value="">All Roles</option>
                      <option value="candidate">Candidates</option>
                      <option value="interviewer">Interviewers</option>
                      {/* <option value="super_admin">Super Admins</option> */}
                    </select>
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.activity}
                      onChange={(e) =>
                        setFilters({ ...filters, activity: e.target.value })
                      }
                    >
                      <option value="">All Users</option>
                      <option value="active">Active Users Only</option>
                    </select>
                  </div>
                </div>

                {/* User Activities List */}
                <div className="space-y-4">
                  {filteredActivities.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                      {/* User Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-gray-700">
                              {user.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {user.username}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(
                                user.role
                              )}`}
                            >
                              {user.role.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Last Activity</p>
                          <p className="font-medium">
                            {user.lastActivity
                              ? new Date(user.lastActivity).toLocaleDateString()
                              : "No activity"}
                          </p>
                        </div>
                      </div>

                      {/* Activity Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <Code size={16} className="text-green-600 mr-2" />
                            <div>
                              <p className="text-sm text-gray-600">
                                Submissions
                              </p>
                              <p className="font-bold text-green-600">
                                {user.totalSubmissions || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle
                              size={16}
                              className="text-blue-600 mr-2"
                            />
                            <div>
                              <p className="text-sm text-gray-600">
                                Success Rate
                              </p>
                              <p className="font-bold text-blue-600">
                                {user.successRate || 0}%
                              </p>
                            </div>
                          </div>
                        </div>

                        {user.role === "interviewer" && (
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="flex items-center">
                              <Calendar
                                size={16}
                                className="text-purple-600 mr-2"
                              />
                              <div>
                                <p className="text-sm text-gray-600">
                                  Interviews Created
                                </p>
                                <p className="font-bold text-purple-600">
                                  {user.totalInterviewsCreated || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {user.role === "candidate" && (
                          <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="flex items-center">
                              <Users
                                size={16}
                                className="text-orange-600 mr-2"
                              />
                              <div>
                                <p className="text-sm text-gray-600">
                                  Interviews Applied
                                </p>
                                <p className="font-bold text-orange-600">
                                  {user.totalInterviewsApplied || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <Activity
                              size={16}
                              className="text-gray-600 mr-2"
                            />
                            <div>
                              <p className="text-sm text-gray-600">
                                Total Activity
                              </p>
                              <p className="font-bold text-gray-600">
                                {user.totalActivity || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Activities */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">
                          Recent Activities
                        </h4>

                        {/* Recent Submissions */}
                        {user.recentSubmissions?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Recent Submissions
                            </h5>
                            <div className="space-y-2">
                              {user.recentSubmissions.map((submission, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                >
                                  <div>
                                    <p className="text-sm font-medium">
                                      {submission.question?.title ||
                                        "Unknown Problem"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {submission.language} •{" "}
                                      {submission.question?.difficulty ||
                                        "Unknown"}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {getStatusIcon(submission.status)}
                                    <span className="text-xs">
                                      {submission.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recent Interviews Created (for interviewers) */}
                        {user.recentInterviewsCreated?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Recent Interviews Created
                            </h5>
                            <div className="space-y-2">
                              {user.recentInterviewsCreated.map(
                                (interview, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 bg-blue-50 rounded"
                                  >
                                    <div>
                                      <p className="text-sm font-medium">
                                        {interview.title}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {interview.candidateCount} candidates
                                        applied
                                        {interview.selectedCandidate &&
                                          ` • Selected: ${interview.selectedCandidate}`}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">
                                        {new Date(
                                          interview.scheduledTime
                                        ).toLocaleDateString()}
                                      </p>
                                      <span
                                        className={`text-xs px-2 py-1 rounded ${
                                          interview.status === "completed"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-yellow-100 text-yellow-600"
                                        }`}
                                      >
                                        {interview.status}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Recent Interviews Applied (for candidates) */}
                        {user.recentInterviewsApplied?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Recent Interviews Applied
                            </h5>
                            <div className="space-y-2">
                              {user.recentInterviewsApplied.map(
                                (interview, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 bg-orange-50 rounded"
                                  >
                                    <div>
                                      <p className="text-sm font-medium">
                                        {interview.title}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Interviewer: {interview.interviewer}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">
                                        {new Date(
                                          interview.scheduledTime
                                        ).toLocaleDateString()}
                                      </p>
                                      <span
                                        className={`text-xs px-2 py-1 rounded ${
                                          interview.status === "completed"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-yellow-100 text-yellow-600"
                                        }`}
                                      >
                                        {interview.status}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* No Activities Message */}
                        {!user.recentSubmissions?.length &&
                          !user.recentInterviewsCreated?.length &&
                          !user.recentInterviewsApplied?.length && (
                            <p className="text-sm text-gray-500 italic">
                              No recent activities
                            </p>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* User Details Modal */}
          {showUserModal && selectedUser && userDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    User Details - {selectedUser.username}
                  </h2>
                  <button onClick={() => setShowUserModal(false)}>
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* User Info & Actions */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {selectedUser.username}
                          </h3>
                          <p className="text-gray-600">{selectedUser.email}</p>
                          <span
                            className={`inline-block mt-2 px-2 py-1 rounded text-sm ${getRoleColor(
                              selectedUser.role
                            )}`}
                          >
                            {selectedUser.role.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {/* Activity Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-2xl font-bold">
                            {userDetails.activityData.totalSubmissions}
                          </p>
                          <p className="text-gray-600">Total Submissions</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-2xl font-bold">
                            {userDetails.activityData.successRate}%
                          </p>
                          <p className="text-gray-600">Success Rate</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Quick Actions</h4>
                        <div className="space-y-2">
                          <select
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={selectedUser.role}
                            onChange={(e) =>
                              handleRoleChange(selectedUser._id, e.target.value)
                            }
                          >
                            <option value="candidate">Candidate</option>
                            <option value="interviewer">Interviewer</option>
                            <option value="super_admin">Super Admin</option>
                          </select>

                          <button
                            onClick={() => {
                              setRestrictionForm({
                                canSubmitCode:
                                  selectedUser.restrictions?.canSubmitCode ??
                                  true,
                                canApplyForInterviews:
                                  selectedUser.restrictions
                                    ?.canApplyForInterviews ?? true,
                                canCreateInterviews:
                                  selectedUser.restrictions
                                    ?.canCreateInterviews ?? true,
                                canViewBadges:
                                  selectedUser.restrictions?.canViewBadges ??
                                  true,
                                restrictionReason:
                                  selectedUser.restrictions
                                    ?.restrictionReason || "",
                              });
                              setShowRestrictModal(true);
                            }}
                            className="w-full flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <Lock size={16} className="mr-2" />
                            Manage Restrictions
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Submissions */}
                  <div>
                    <h4 className="font-semibold mb-3">Recent Submissions</h4>
                    <div className="space-y-2">
                      {userDetails.submissions.map((submission) => (
                        <div
                          key={submission._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <div>
                            <p className="font-medium">
                              {submission.question?.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {submission.language} •{" "}
                              {submission.question?.difficulty}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(submission.status)}
                            <span className="text-sm">{submission.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Restriction Modal */}
          {showRestrictModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    Manage User Restrictions
                  </h2>
                  <button onClick={() => setShowRestrictModal(false)}>
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleRestrictUser} className="space-y-4">
                  {Object.entries(restrictionForm)
                    .filter(([key]) => key !== "restrictionReason")
                    .map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setRestrictionForm({
                              ...restrictionForm,
                              [key]: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </span>
                      </label>
                    ))}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restriction Reason
                    </label>
                    <textarea
                      value={restrictionForm.restrictionReason}
                      onChange={(e) =>
                        setRestrictionForm({
                          ...restrictionForm,
                          restrictionReason: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      rows="3"
                      placeholder="Enter reason for restrictions..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowRestrictModal(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Apply Restrictions
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SuperAdminDashboard;
