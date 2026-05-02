require("dotenv").config({ path: "./backend/.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Project = require("./models/Project");
const Task = require("./models/Task");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log("Cleared existing data.");

    // Create Admin
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin"
    });

    // Create Members
    const john = await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: "member"
    });

    const jane = await User.create({
      name: "Jane Smith",
      email: "jane@example.com",
      password: "password123",
      role: "member"
    });

    console.log("Created Users: Admin, John, Jane.");

    // Create Project
    const project = await Project.create({
      name: "E-Commerce App Redesign",
      description: "Complete UI/UX overhaul of the main store and checkout process.",
      owner: admin._id,
      members: [john._id, jane._id],
      status: "active",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    console.log("Created Project: E-Commerce App Redesign");

    // Create Tasks
    await Task.create([
      {
        title: "Design Wireframes",
        description: "Create low-fidelity wireframes for the homepage.",
        project: project._id,
        assignedTo: john._id,
        createdBy: admin._id,
        status: "done",
        priority: "high",
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        title: "API Integration",
        description: "Connect the frontend checkout form to the payment gateway.",
        project: project._id,
        assignedTo: jane._id,
        createdBy: admin._id,
        status: "in-progress",
        priority: "high",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      },
      {
        title: "Setup Deployment Pipeline",
        description: "Configure GitHub Actions and Vercel for auto-deployment.",
        project: project._id,
        assignedTo: john._id,
        createdBy: admin._id,
        status: "todo",
        priority: "medium",
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Mobile App Bugfix",
        description: "Fix the layout issue on the checkout page for iPhone users.",
        project: project._id,
        assignedTo: jane._id,
        createdBy: admin._id,
        status: "todo",
        priority: "low",
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago (Overdue!)
      },
      {
        title: "Market Research",
        description: "Analyze competitor checkout flows and report findings.",
        project: project._id,
        assignedTo: null, // UNASSIGNED - Perfect for testing 'Take This Task'
        createdBy: admin._id,
        status: "todo",
        priority: "medium",
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log("Created 4 sample tasks.");
    console.log("Seeding completed successfully! 🌱");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedData();
