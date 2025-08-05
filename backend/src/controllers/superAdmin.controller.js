import User from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, "Email already in use");

  const hashed = await bcrypt.hash(password, 10);
  const admin = await User.create({
    name,
    email,
    password: hashed,
    role: "admin",
  });

  res.status(201).json({ message: "Admin created", admin });
});
