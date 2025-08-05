import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import BlacklistedToken from "../models/BlacklistedToken.js";

// export const verifyJWT = asyncHandler(async (req, _, next) => {
//   // Try to get token from cookies or Authorization header
//   const cookieToken = req.cookies?.accessToken;
//   const authHeader = req.header("Authorization");

//   let token = null;
  
//    if (cookieToken) {
//      token = cookieToken;
//    } else if (authHeader && authHeader.startsWith("Bearer ")) {
//      token = authHeader.split(" ")[1];
//    }

//    if (!token) {
//      throw new ApiError(401, "Unauthorized request: Token not found");
//    }

//   // // Check blacklist
//   // const isBlacklisted = await BlacklistedToken.findOne({ token });
//   // if (isBlacklisted)
//   //   return res.status(401).json({ message: "Token has been logged out" });

//   try {
//     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     const user = await User.findById(decodedToken.id).select("-password");

//     if (!user) {
//       throw new ApiError(401, "Invalid access token");
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     throw new ApiError(401, error?.message || "Invalid access token");
//   }
// });

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized: Token missing");
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decoded.id).select("-password");
  if (!user) throw new ApiError(401, "Invalid token");

  req.user = user;
  next();
});
