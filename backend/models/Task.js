const mongoose = require("mongoose");

/**
 * Comment sub-schema (embedded in Task)
 */
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

/**
 * Task Schema
 * - project: parent project (ref → Project)
 * - assignedTo: the user responsible (ref → User)
 * - createdBy: admin who created the task (ref → User)
 * - status: "todo" | "in-progress" | "done"
 * - deadline: optional due date for overdue detection
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    deadline: {
      type: Date,
      default: null,
    },
    comments: [commentSchema],
  },
  { timestamps: true }
);

// ── Virtual: isOverdue ───────────────────────────────────────────────────────
taskSchema.virtual("isOverdue").get(function () {
  return this.deadline && this.status !== "done" && new Date() > this.deadline;
});

taskSchema.set("toJSON", { virtuals: true });
taskSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Task", taskSchema);
