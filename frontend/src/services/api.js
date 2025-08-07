import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const logout = () => API.post("/auth/logout");
export const updateProfile = (data) => API.put("/auth/update-profile", data);

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
export const createBadge = (data) => API.post("/badges", data);

// Notifications
export const getNotifications = () => API.get("/notifications");

// Super Admin
export const getAllUsers = () => API.get("/super-admin/users");
export const createAdmin = (data) =>
  API.post("/super-admin/create-admin", data);
