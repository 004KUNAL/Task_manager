/**
 * authorizeRoles – restricts route access to specific roles.
 * Usage: router.get("/admin-route", protect, authorizeRoles("admin"), handler)
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to perform this action.`,
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };
