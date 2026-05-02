import { Bell, Check, Trash2, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { formatDistanceToNow } from "date-fns";

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header style={{
      height: 64, background: "rgba(13,17,23,0.9)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--color-border)", display: "flex",
      alignItems: "center", justifyContent: "space-between",
      padding: "0 28px", position: "sticky", top: 0, zIndex: 30
    }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text)" }}>{title}</h1>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              background: "var(--color-surface)", border: "1px solid var(--color-border)",
              borderRadius: 8, padding: 8, cursor: "pointer", color: unreadCount > 0 ? "var(--color-primary)" : "var(--color-muted)",
              display: "flex", alignItems: "center", position: "relative",
              transition: "all 0.2s"
            }}>
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4, minWidth: 16, height: 16,
                padding: "0 4px", borderRadius: 8, background: "var(--color-danger)",
                color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", 
                alignItems: "center", justifyContent: "center"
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="glass-card fade-in" style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              width: 320, maxHeight: 400, overflowY: "auto", zIndex: 100,
              padding: 0, boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
            }}>
              <div style={{ padding: "16px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: "none", border: "none", color: "var(--color-primary)", fontSize: 11, cursor: "pointer" }}>Mark all read</button>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "var(--color-muted)", fontSize: 13 }}>No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} onClick={() => !n.isRead && markRead(n._id)} style={{
                      padding: "12px 16px", borderBottom: "1px solid var(--color-border)",
                      background: n.isRead ? "transparent" : "rgba(124,58,237,0.05)",
                      cursor: "pointer", transition: "background 0.2s"
                    }}>
                      <p style={{ fontSize: 13, color: n.isRead ? "var(--color-muted)" : "var(--color-text)", marginBottom: 4 }}>{n.message}</p>
                      <span style={{ fontSize: 10, color: "var(--color-muted)" }}>{formatDistanceToNow(new Date(n.createdAt))} ago</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <span className={`badge badge-${user?.role}`}>
          {user?.role}
        </span>
      </div>
    </header>
  );
};

export default Navbar;
