require("dotenv").config({ path: "./backend/.env" });
const mongoose = require("mongoose");
const User = require("./models/User");
const Project = require("./models/Project");
const Task = require("./models/Task");

const clearData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Delete everything
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({})
    ]);

    console.log("Database cleared successfully! 🧹");
    console.log("You can now start fresh by signing up your Admin account.");
    process.exit(0);
  } catch (err) {
    console.error("Clear failed:", err);
    process.exit(1);
  }
};

clearData();
