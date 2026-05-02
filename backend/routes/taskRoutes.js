const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  getDashboardStats,
  claimTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// All routes require authentication
router.use(protect);

// Dashboard stats — placed before /:id to avoid conflict
router.get("/stats", getDashboardStats);

router.put("/:id/claim", claimTask);

router.route("/")
  .get(getTasks)
  .post(authorizeRoles("admin"), createTask);

router.route("/:id")
  .get(getTaskById)
  .put(updateTask)                           // Admin: all fields | Member: status only
  .delete(authorizeRoles("admin"), deleteTask);

router.post("/:id/comments", addComment);

module.exports = router;
