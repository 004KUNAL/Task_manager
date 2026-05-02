import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import KanbanBoard from "../components/KanbanBoard";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Plus, X, Calendar, Users } from "lucide-react";
import { format } from "date-fns";

// ── Task Modal ───────────────────────────────────────────────────────────────
const TaskModal = ({ task, projectId, members, onClose, onSave }) => {
  const [form, setForm] = useState({
    title:       task?.title || "",
    description: task?.description || "",
    assignedTo:  task?.assignedTo?._id || "",
    status:      task?.status || "todo",
    priority:    task?.priority || "medium",
    deadline:    task?.deadline ? task.deadline.slice(0, 10) : "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required."); return; }
    onSave({ ...form, projectId });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{task ? "Edit Task" : "New Task"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-muted)", cursor: "pointer", display: "flex" }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="form-label">Task Title *</label>
            <input className="form-input" placeholder="e.g. Design homepage wireframe" value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} placeholder="Task details…" value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} style={{ resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">Assign To</label>
              <select className="form-input" value={form.assignedTo}
                onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}>
                <option value="">Unassigned</option>
                {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="form-label">Deadline</label>
              <input className="form-input" type="date" value={form.deadline}
                onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{task ? "Save Changes" : "Create Task"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main ProjectDetail Page ───────────────────────────────────────────────────
const ProjectDetail = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);
  const [memberStatusTask, setMemberStatusTask] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`),
      ]);
      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks);
    } catch {
      toast.error("Failed to load project.");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleClaimTask = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}/claim`);
      toast.success("Task claimed!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Claim failed.");
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      toast.success("Status updated!");
      setMemberStatusTask(null);
      fetchData();
    } catch { toast.error("Update failed."); }
  };

  const handleSaveTask = async (form) => {
    try {
      if (editTask) {
        await api.put(`/tasks/${editTask._id}`, form);
        toast.success("Task updated!");
      } else {
        await api.post("/tasks", form);
        toast.success("Task created!");
      }
      setShowModal(false);
      setEditTask(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted.");
      fetchData();
    } catch { toast.error("Delete failed."); }
  };

  if (loading) return (
    <div style={{ display: "flex", height: "100vh", background: "var(--color-bg)" }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--color-muted)" }}>Loading…</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar title={project?.name || "Project"} />

        <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Back + info */}
          <div>
            <button className="btn-secondary" style={{ marginBottom: 16, fontSize: 13 }} onClick={() => navigate("/projects")}>
              <ArrowLeft size={14} /> Back to Projects
            </button>

            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{project?.name}</h2>
                  {project?.description && (
                    <p style={{ fontSize: 14, color: "var(--color-muted)" }}>{project.description}</p>
                  )}
                </div>
                {isAdmin && (
                  <button className="btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
                    <Plus size={16} /> Add Task
                  </button>
                )}
              </div>

              <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-muted)" }}>
                  <Users size={14} /> {project?.members?.length || 0} Members:&nbsp;
                  {project?.members?.map((m) => (
                    <span key={m._id} className="badge badge-member" style={{ marginLeft: 4 }}>{m.name}</span>
                  ))}
                </div>
                {project?.deadline && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-muted)" }}>
                    <Calendar size={14} /> Due {format(new Date(project.deadline), "MMMM d, yyyy")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Kanban */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
              Tasks ({tasks.length})
            </h3>
            <KanbanBoard 
              tasks={tasks} 
              onEdit={isAdmin ? (t) => { setEditTask(t); setShowModal(true); } : (t) => { setMemberStatusTask(t); }} 
              onDelete={isAdmin ? handleDeleteTask : null} 
              onClaim={handleClaimTask}
            />
          </div>
        </main>
      </div>

      {showModal && (
        <TaskModal
          task={editTask}
          projectId={id}
          members={project?.members || []}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={handleSaveTask}
        />
      )}

      {/* Member Quick Status Modal */}
      {memberStatusTask && (
        <div className="modal-overlay" onClick={() => setMemberStatusTask(null)}>
          <div className="modal-box" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
             <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Update Status</h2>
             <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 20 }}>{memberStatusTask.title}</p>
             <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["todo", "in-progress", "done"].map(s => (
                  <button key={s} className="btn-secondary" style={{ justifyContent: "center" }}
                    onClick={() => handleStatusUpdate(memberStatusTask._id, s)}>
                    {s.toUpperCase()}
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
