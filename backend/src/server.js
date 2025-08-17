import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

// Import Routes
import authRoutes from "./routes/auth.route.js";
import dsaRoutes from "./routes/dsa.route.js";
import submissionRoutes from "./routes/submission.route.js";
import badgeRoutes from "./routes/badge.route.js";
import interviewRoutes from "./routes/interview.route.js";
import notificationRoutes from "./routes/notification.route.js";
import superAdminRoutes from "./routes/superAdmin.route.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express App
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://crack-it-jade.vercel.app",
      "https://crack-it-jade.vercel.app/",
      "http://localhost:5173",
      "http://localhost:5174",
    ], // Multiple allowed origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// Additional headers for Google OAuth
app.use((req, res, next) => {
  res.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.header("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use(morgan("dev"));
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dsa", dsaRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/super-admin", superAdminRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error Handling
app.use((req, res, next) => {
  res.status(404).json({ message: "Route Not Found" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.statusCode || 500).json({
    message: err.message || "Server Error",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
