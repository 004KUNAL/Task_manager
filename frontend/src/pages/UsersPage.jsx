import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Trash2, ShieldCheck, ShieldOff, Users2 } from "lucide-react";

const UsersPage = () => {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users);
    } catch { toast.error("Failed to load users."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleToggle = async (user) => {
    const newRole = user.role === "admin" ? "member" : "admin";
    try {
      await api.put(`/users/${user._id}/role`, { role: newRole });
      toast.success(`${user.name} is now a ${newRole}.`);
      fetchUsers();
    } catch { toast.error("Role update failed."); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted.");
      fetchUsers();
    } catch { toast.error("Delete failed."); }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar title="User Management" />

        <main style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
              {users.length} registered user{users.length !== 1 ? "s" : ""}
            </p>
          </div>

          {loading ? (
            <p style={{ color: "var(--color-muted)" }}>Loading…</p>
          ) : (
            <div className="glass-card" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {["User", "Email", "Role", "Joined", "Actions"].map((h) => (
                      <th key={h} style={{
                        padding: "14px 20px", textAlign: "left", fontSize: 12,
                        fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                      {/* Avatar + Name */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: 13, color: "#fff", flexShrink: 0
                          }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>

                      <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--color-muted)" }}>{u.email}</td>

                      <td style={{ padding: "14px 20px" }}>
                        <span className={`badge badge-${u.role}`}>{u.role}</span>
                      </td>

                      <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--color-muted)" }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            title={u.role === "admin" ? "Demote to Member" : "Promote to Admin"}
                            onClick={() => handleRoleToggle(u)}
                            style={{
                              background: "none", border: "1px solid var(--color-border)",
                              borderRadius: 6, padding: "5px 8px", cursor: "pointer",
                              color: u.role === "admin" ? "var(--color-warning)" : "var(--color-success)",
                              display: "flex", transition: "all 0.2s"
                            }}>
                            {u.role === "admin" ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                          </button>
                          <button
                            title="Delete user"
                            onClick={() => handleDelete(u._id, u.name)}
                            style={{
                              background: "none", border: "1px solid var(--color-border)",
                              borderRadius: 6, padding: "5px 8px", cursor: "pointer",
                              color: "var(--color-danger)", display: "flex", transition: "all 0.2s"
                            }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div style={{ padding: 60, textAlign: "center" }}>
                  <Users2 size={48} style={{ color: "var(--color-muted)", margin: "0 auto 12px" }} />
                  <p style={{ color: "var(--color-muted)" }}>No users found.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UsersPage;
