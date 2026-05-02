import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, FolderKanban, CheckSquare,
  Users, LogOut, Zap
} from "lucide-react";

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    { to: "/dashboard", label: "Dashboard",  icon: <LayoutDashboard size={18} /> },
    { to: "/projects",  label: "Projects",   icon: <FolderKanban size={18} /> },
    { to: "/tasks",     label: "My Tasks",   icon: <CheckSquare size={18} /> },
    ...(isAdmin ? [{ to: "/users", label: "Users", icon: <Users size={18} /> }] : []),
  ];

  return (
    <aside style={{
      width: 240, minHeight: "100vh", background: "var(--color-surface)",
      borderRight: "1px solid var(--color-border)", display: "flex",
      flexDirection: "column", padding: "20px 12px", position: "fixed",
      top: 0, left: 0, zIndex: 40
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px 24px" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Zap size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text)" }}>Task Manager</div>
          <div style={{ fontSize: 11, color: "var(--color-muted)" }}>Workspace</div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div style={{
        borderTop: "1px solid var(--color-border)", paddingTop: 16, display: "flex",
        flexDirection: "column", gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px" }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 14, color: "#fff", flexShrink: 0
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-muted)" }}>
              {user?.role}
            </div>
          </div>
        </div>
        <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={handleLogout}>
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
