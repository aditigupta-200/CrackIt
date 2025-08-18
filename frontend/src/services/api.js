import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  // baseURL: "http://localhost:5000/api", // Local backend for development
  baseURL: "https://crackit-final.onrender.com/api", // Production backend
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken") || localStorage.getItem("token");
  console.log(
    "API Request:",
    config.url,
    "Token:",
    token ? "Present" : "Missing"
  );
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const logout = () => API.post("/auth/logout");
export const updateProfile = (data) => API.put("/auth/update-profile", data);
export const googleLogin = (data) => API.post("/auth/google", data);

// User Profile & Progress - Fixed endpoints
export const getUserProfile = () => API.get("/auth/profile");
export const getUserProgress = () => API.get("/auth/progress");

// DSA
export const getDSAQuestions = () => API.get("/dsa");
export const addDSAQuestion = (data) => API.post("/dsa", data);

// Submissions
export const runCode = (data) => API.post("/submissions/run", data);

// Interviews
export const getInterviews = () => API.get("/interviews");
export const createInterview = (data) => API.post("/interviews", data);
export const applyForInterview = (data) => API.post("/interviews/apply", data);

// Badges
export const getUserBadges = () => API.get("/badges/my");
export const getAllBadges = () => API.get("/badges");
export const createBadge = (data) => API.post("/badges", data);
export const createBadgeTest = (data) => API.post("/badges/test", data); // Temporary test endpoint
export const updateBadge = (id, data) => API.put(`/badges/${id}`, data);
export const deleteBadge = (id) => API.delete(`/badges/${id}`);
export const awardBadgeToUser = (data) => API.post("/badges/award", data);
export const getBadgeStats = () => API.get("/badges/stats");
export const debugCurrentUser = () => API.get("/badges/debug/me");

// Notifications
export const getNotifications = () => API.get("/notifications");

// Super Admin
export const getAllUsers = () => API.get("/super-admin/users");
export const createAdmin = (data) =>
  API.post("/super-admin/create-admin", data);
export const getDashboardStats = () => API.get("/super-admin/stats");
export const getUserActivities = (params) =>
  API.get("/super-admin/activities", { params });
export const getUserDetails = (userId) =>
  API.get(`/super-admin/users/${userId}`);
export const updateUserRole = (userId, role) =>
  API.put(`/super-admin/users/${userId}/role`, { role });
export const restrictUser = (userId, restrictions) =>
  API.put(`/super-admin/users/${userId}/restrict`, { restrictions });
// export const getUserProgress = () => API.get("/users/progress");
