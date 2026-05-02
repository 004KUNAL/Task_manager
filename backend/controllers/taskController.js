const Task = require("../models/Task");
const Project = require("../models/Project");
const Notification = require("../models/Notification");

/**
 * @desc    Create a task within a project
 * @route   POST /api/tasks
 * @access  Private/Admin
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, status, priority, deadline } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, message: "Title and projectId are required." });
    }

    // Verify the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      status: status || "todo",
      priority: priority || "medium",
      deadline: deadline || null,
    });

    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    if (assignedTo) {
      await Notification.create({
        recipient: assignedTo,
        sender: req.user._id,
        message: `New Task: "${task.title}" has been assigned to you.`,
        type: "assignment",
        relatedTask: task._id
      });
    }

    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all tasks (with optional filters)
 * @route   GET /api/tasks?projectId=&status=&assignedTo=
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, assignedTo } = req.query;

    const filter = {};
    if (status) filter.status = status;

    // Members can only see tasks assigned to them
    if (req.user.role === "member") {
      if (projectId) {
        // If a member is viewing a specific project, they can see all tasks in it
        // Note: Project membership check is handled by the route or can be added here
        filter.project = projectId;
      } else {
        // In general views (like dashboard), only show their assigned tasks
        filter.assignedTo = req.user._id;
      }
    } else {
      if (projectId) filter.project = projectId;
      if (assignedTo) filter.assignedTo = assignedTo;
    }

    const tasks = await Task.find(filter)
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("comments.user", "name");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    res.status(200).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a task (Admin: all fields; Member: only status if assigned)
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    const oldStatus = task.status;
    if (req.user.role === "member") {
      // Members can only update their own task's status
      if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only update status of tasks assigned to you.",
        });
      }
      // Only allow status update for members
      task.status = req.body.status || task.status;
    } else {
      // Admin can update all fields
      const { title, description, assignedTo, status, priority, deadline } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (deadline !== undefined) task.deadline = deadline;
    }

    await task.save();

    if (task.status === "done" && oldStatus !== "done") {
      const project = await Project.findById(task.project);
      if (project) {
        await Notification.create({
          recipient: project.owner,
          sender: req.user._id,
          message: `Task Done: "${task.title}" was completed by ${req.user.name}.`,
          type: "status_update",
          relatedTask: task._id
        });
      }
    }

    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    res.status(200).json({ success: true, message: "Task updated.", task });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a task (Admin only)
 * @route   DELETE /api/tasks/:id
 * @access  Private/Admin
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }
    res.status(200).json({ success: true, message: "Task deleted." });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add a comment to a task
 * @route   POST /api/tasks/:id/comments
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Comment text is required." });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    task.comments.push({ user: req.user._id, text });
    await task.save();
    await task.populate("comments.user", "name");

    res.status(201).json({ success: true, message: "Comment added.", comments: task.comments });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get dashboard stats
 * @route   GET /api/tasks/stats
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const filter = req.user.role === "member" ? { assignedTo: req.user._id } : {};
    const projectFilter = req.user.role === "member" ? { members: req.user._id } : {};

    const [total, completed, inProgress, todo, overdue, totalProjects] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: "done" }),
      Task.countDocuments({ ...filter, status: "in-progress" }),
      Task.countDocuments({ ...filter, status: "todo" }),
      Task.countDocuments({
        ...filter,
        status: { $ne: "done" },
        deadline: { $lt: new Date() },
      }),
      Project.countDocuments(projectFilter),
    ]);

    res.status(200).json({
      success: true,
      stats: { total, completed, inProgress, todo, overdue, totalProjects },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Claim a task (Member self-assignment)
 * @route   PUT /api/tasks/:id/claim
 * @access  Private (Member)
 */
const claimTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });

    // Check if already assigned
    if (task.assignedTo && (task.assignedTo.toString() === req.user._id.toString())) {
      return res.status(400).json({ success: false, message: "Task is already assigned to you." });
    }

    task.assignedTo = req.user._id;
    await task.save();

    // Notify Admin
    const project = await Project.findById(task.project);
    if (project) {
      await Notification.create({
        recipient: project.owner,
        sender: req.user._id,
        message: `Task Claimed: "${task.title}" has been accepted by ${req.user.name}.`,
        type: "status_update",
        relatedTask: task._id
      });
    }

    res.status(200).json({ success: true, message: "Task claimed successfully.", task });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  getDashboardStats,
  claimTask,
};
