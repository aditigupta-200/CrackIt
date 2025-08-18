// createSuperAdmin.js - Script to create or update a user to super_admin
import mongoose from "mongoose";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

const createSuperAdmin = async () => {
  try {
    console.log("Creating/updating super admin user...");
    await connectDB();

    // Check if super admin already exists
    let superAdmin = await User.findOne({ role: "super_admin" });

    if (superAdmin) {
      console.log(
        `Super admin already exists: ${superAdmin.username} (${superAdmin.email})`
      );
    } else {
      // Check if there's a user we can promote
      const existingUser = await User.findOne({});

      if (existingUser) {
        // Promote existing user to super admin
        existingUser.role = "super_admin";
        await existingUser.save();
        console.log(`✅ Promoted user ${existingUser.username} to super_admin`);
        superAdmin = existingUser;
      } else {
        // Create a new super admin user
        const hashedPassword = await bcrypt.hash("admin123", 10);
        superAdmin = await User.create({
          username: "admin",
          email: "admin@crackit.com",
          password: hashedPassword,
          role: "super_admin",
          badges: ["Welcome"],
        });
        console.log(`✅ Created new super admin: ${superAdmin.username}`);
      }
    }

    console.log("Super Admin Details:");
    console.log(`- Username: ${superAdmin.username}`);
    console.log(`- Email: ${superAdmin.email}`);
    console.log(`- Role: ${superAdmin.role}`);
    console.log(`- ID: ${superAdmin._id}`);
  } catch (error) {
    console.error("Error creating super admin:", error);
  } finally {
    console.log("Closing database connection...");
    mongoose.connection.close();
  }
};

// Run the script
console.log("Super Admin Creator Script Started");
createSuperAdmin()
  .then(() => {
    console.log("Script completed");
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });

export default createSuperAdmin;
