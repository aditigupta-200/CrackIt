// seedBadges.js - Script to populate default badges
import mongoose from "mongoose";
import Badge from "./models/Badge.js";
import User from "./models/User.js";
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

const defaultBadges = [
  {
    name: "Easy Starter",
    description: "Solve your first easy problem",
    requiredPoints: 0,
    criteria: {
      type: "difficulty",
      value: "easy",
      operator: "greater_equal",
    },
    icon: "🌱",
    color: "#4CAF50",
  },
  {
    name: "Medium Challenger",
    description: "Solve your first medium problem",
    requiredPoints: 0,
    criteria: {
      type: "difficulty",
      value: "medium",
      operator: "greater_equal",
    },
    icon: "⚡",
    color: "#FF9800",
  },
  {
    name: "Hard Conqueror",
    description: "Solve your first hard problem",
    requiredPoints: 0,
    criteria: {
      type: "difficulty",
      value: "hard",
      operator: "greater_equal",
    },
    icon: "🔥",
    color: "#F44336",
  },
  {
    name: "Problem Solver",
    description: "Solve 10 problems in total",
    requiredPoints: 0,
    criteria: {
      type: "total_problems",
      value: 10,
      operator: "greater_equal",
    },
    icon: "🎯",
    color: "#2196F3",
  },
  {
    name: "Century Club",
    description: "Solve 100 problems in total",
    requiredPoints: 0,
    criteria: {
      type: "total_problems",
      value: 100,
      operator: "greater_equal",
    },
    icon: "💯",
    color: "#9C27B0",
  },
  {
    name: "7-Day Streak",
    description: "Maintain a 7-day solving streak",
    requiredPoints: 0,
    criteria: {
      type: "streak",
      value: 7,
      operator: "greater_equal",
    },
    icon: "🔥",
    color: "#FF5722",
  },
  {
    name: "30-Day Streak",
    description: "Maintain a 30-day solving streak",
    requiredPoints: 0,
    criteria: {
      type: "streak",
      value: 30,
      operator: "greater_equal",
    },
    icon: "🌟",
    color: "#E91E63",
  },
  {
    name: "Point Master",
    description: "Earn 100 points",
    requiredPoints: 0,
    criteria: {
      type: "points",
      value: 100,
      operator: "greater_equal",
    },
    icon: "💰",
    color: "#FFC107",
  },
  {
    name: "Elite Coder",
    description: "Earn 500 points",
    requiredPoints: 0,
    criteria: {
      type: "points",
      value: 500,
      operator: "greater_equal",
    },
    icon: "👑",
    color: "#FFD700",
  },
];

const seedBadges = async () => {
  try {
    console.log("Starting badge seeding process...");
    await connectDB();

    // Find a super admin user to assign as creator
    console.log("Looking for super admin user...");
    const superAdmin = await User.findOne({ role: "super_admin" });
    
    if (!superAdmin) {
      console.log("No super admin found. Looking for any user...");
      const anyUser = await User.findOne({});
      if (!anyUser) {
        console.log("No users found in database. Please create a user first.");
        return;
      }
      console.log(`Using user ${anyUser.username} (${anyUser.role}) as badge creator`);
    } else {
      console.log(`Found super admin: ${superAdmin.username}`);
    }

    const creatorUser = superAdmin || await User.findOne({});

    // Check existing badges
    const existingBadges = await Badge.find({});
    console.log(`Found ${existingBadges.length} existing badges`);

    // Clear existing badges (optional - remove this line if you want to keep existing badges)
    if (existingBadges.length > 0) {
      await Badge.deleteMany({});
      console.log("Cleared existing badges");
    }

    // Create badges
    const badgesWithCreator = defaultBadges.map(badge => ({
      ...badge,
      createdBy: creatorUser._id,
    }));

    console.log(`Creating ${badgesWithCreator.length} badges...`);
    const createdBadges = await Badge.insertMany(badgesWithCreator);
    console.log(`✅ Created ${createdBadges.length} badges successfully!`);

    // List created badges
    createdBadges.forEach(badge => {
      console.log(`🏆 ${badge.name} - ${badge.description} (${badge.criteria.type}: ${badge.criteria.value})`);
    });

    console.log("Badge seeding completed successfully!");

  } catch (error) {
    console.error("Error seeding badges:", error);
  } finally {
    console.log("Closing database connection...");
    mongoose.connection.close();
  }
};

// Run the seeder if called directly
console.log("Badge seeder script started");
seedBadges().then(() => {
  console.log("Seeder process completed");
}).catch((error) => {
  console.error("Seeder failed:", error);
  process.exit(1);
});

export default seedBadges;
