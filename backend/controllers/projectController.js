const Project = require("../models/Project");
const Task = require("../models/Task");

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private/Admin
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, deadline, members } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Project name is required." });
    }

    const project = await Project.create({
      name,
      description,
      deadline,
      owner: req.user._id,
      members: members || [],
    });

    await project.populate("owner", "name email role");
    await project.populate("members", "name email role");

    res.status(201).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all projects (Admin sees all; Member sees only their projects)
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : { members: req.user._id };

    const projects = await Project.find(filter)
      .populate("owner", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: projects.length, projects });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email role")
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    // Members can only view projects they belong to
    if (
      req.user.role !== "admin" &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a project
 * @route   PUT /api/projects/:id
 * @access  Private/Admin
 */
const updateProject = async (req, res, next) => {
  try {
    const { name, description, deadline, status } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, deadline, status },
      { new: true, runValidators: true }
    )
      .populate("owner", "name email role")
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    res.status(200).json({ success: true, message: "Project updated.", project });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a project (also deletes associated tasks)
 * @route   DELETE /api/projects/:id
 * @access  Private/Admin
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    // Cascade delete all tasks belonging to this project
    await Task.deleteMany({ project: req.params.id });

    res.status(200).json({ success: true, message: "Project and its tasks deleted." });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add a member to a project
 * @route   PUT /api/projects/:id/members/add
 * @access  Private/Admin
 */
const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } }, // $addToSet prevents duplicates
      { new: true }
    )
      .populate("owner", "name email role")
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    res.status(200).json({ success: true, message: "Member added.", project });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove a member from a project
 * @route   PUT /api/projects/:id/members/remove
 * @access  Private/Admin
 */
const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: userId } },
      { new: true }
    )
      .populate("owner", "name email role")
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    res.status(200).json({ success: true, message: "Member removed.", project });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
