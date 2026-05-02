const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// All routes require authentication
router.use(protect);

router.route("/")
  .get(getProjects)                          // Admin: all | Member: own
  .post(authorizeRoles("admin"), createProject);

router.route("/:id")
  .get(getProjectById)
  .put(authorizeRoles("admin"), updateProject)
  .delete(authorizeRoles("admin"), deleteProject);

router.put("/:id/members/add", authorizeRoles("admin"), addMember);
router.put("/:id/members/remove", authorizeRoles("admin"), removeMember);

module.exports = router;
