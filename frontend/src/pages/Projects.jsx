import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Plus, FolderOpen, Users, Pencil, Trash2, X, Calendar } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  active: "var(--color-success)",
  completed: "var(--color-accent)",
  archived: "var(--color-muted)",
};

// ── Modal for Create/Edit Project ────────────────────────────────────────────
const ProjectModal = ({ project, onClose, onSave, allUsers }) => {
  const [form, setForm] = useState({
    name: project?.name || "",
    description: project?.description || "",
    deadline: project?.deadline ? project.deadline.slice(0, 10) : "",
    status: project?.status || "active",
    members: project?.members?.map((m) => m._id) || [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Project name is required."); return; }
    onSave(form);
  };

  const toggleMember = (id) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.includes(id)
        ? prev.members.filter((m) => m !== id)
        : [...prev.members, id],
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{project ? "Edit Project" : "New Project"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-muted)", cursor: "pointer", display: "flex" }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="form-label">Project Name *</label>
            <input className="form-input" placeholder="e.g. Website Redesign" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} placeholder="What is this project about?" value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">Deadline</label>
              <input className="form-input" type="date" value={form.deadline}
                onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Member selector */}
          <div>
            <label className="form-label">Add Members</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
              {allUsers.map((u) => (
                <button key={u._id} type="button" onClick={() => toggleMember(u._id)} style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                  border: "1px solid",
                  borderColor: form.members.includes(u._id) ? "var(--color-primary)" : "var(--color-border)",
                  background: form.members.includes(u._id) ? "rgba(124,58,237,0.2)" : "transparent",
                  color: form.members.includes(u._id) ? "#a78bfa" : "var(--color-muted)",
                  cursor: "pointer", transition: "all 0.2s"
                }}>
                  {u.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{project ? "Save Changes" : "Create Project"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Projects Page ────────────────────────────────────────────────────────
const Projects = () => {
  const { isAdmin } = useAuth();
  const navigate    = useNavigate();

  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const fetchAll = async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        api.get("/projects"),
        isAdmin ? api.get("/users") : Promise.resolve({ data: { users: [] } }),
      ]);
      setProjects(projRes.data.projects);
      setAllUsers(userRes.data.users || []);
    } catch {
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async (form) => {
    try {
      if (editTarget) {
        await api.put(`/projects/${editTarget._id}`, form);
        toast.success("Project updated!");
      } else {
        await api.post("/projects", form);
        toast.success("Project created!");
      }
      setShowModal(false);
      setEditTarget(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Project deleted.");
      fetchAll();
    } catch {
      toast.error("Delete failed.");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar title="Projects" />

        <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ color: "var(--color-muted)", fontSize: 14 }}>
              {projects.length} project{projects.length !== 1 ? "s" : ""} found
            </p>
            {isAdmin && (
              <button className="btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>
                <Plus size={16} /> New Project
              </button>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <p style={{ color: "var(--color-muted)" }}>Loading…</p>
          ) : projects.length === 0 ? (
            <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
              <FolderOpen size={48} style={{ color: "var(--color-muted)", margin: "0 auto 12px" }} />
              <p style={{ color: "var(--color-muted)" }}>No projects yet. {isAdmin && "Create one to get started!"}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {projects.map((p) => (
                <div key={p._id} className="glass-card fade-in" style={{ padding: 22, cursor: "pointer", transition: "transform 0.2s, border-color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "var(--color-primary)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
                >
                  {/* Status dot + name */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColors[p.status], flexShrink: 0 }} />
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}
                        onClick={() => navigate(`/projects/${p._id}`)}>
                        {p.name}
                      </h3>
                    </div>
                    {isAdmin && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", display: "flex" }}
                          onClick={(e) => { e.stopPropagation(); setEditTarget(p); setShowModal(true); }}>
                          <Pencil size={14} />
                        </button>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)", display: "flex" }}
                          onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {p.description && (
                    <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 14, lineHeight: 1.5 }}>
                      {p.description.slice(0, 90)}{p.description.length > 90 ? "…" : ""}
                    </p>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--color-muted)" }}>
                      <Users size={12} /> {p.members?.length || 0} member{p.members?.length !== 1 ? "s" : ""}
                    </div>
                    {p.deadline && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--color-muted)" }}>
                        <Calendar size={12} /> {format(new Date(p.deadline), "MMM d, yyyy")}
                      </div>
                    )}
                  </div>

                  <button className="btn-secondary" style={{ width: "100%", justifyContent: "center", marginTop: 16, fontSize: 13 }}
                    onClick={() => navigate(`/projects/${p._id}`)}>
                    View Tasks →
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <ProjectModal
          project={editTarget}
          allUsers={allUsers}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Projects;
