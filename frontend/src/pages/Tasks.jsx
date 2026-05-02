import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TaskCard from "../components/TaskCard";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Search, SlidersHorizontal, X } from "lucide-react";

const STATUSES = ["all", "todo", "in-progress", "done"];
const PRIORITIES = ["all", "low", "medium", "high"];

// ── Status Update Modal (for members) ────────────────────────────────────────
const StatusModal = ({ task, onClose, onUpdate }) => {
  const [status, setStatus] = useState(task.status);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Update Status</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-muted)", cursor: "pointer", display: "flex" }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 16 }}>{task.title}</p>
        <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ marginBottom: 20 }}>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => onUpdate(task._id, status)}>Update</button>
        </div>
      </div>
    </div>
  );
};

// ── Comment Panel ─────────────────────────────────────────────────────────────
const CommentPanel = ({ task, onClose, onAddComment }) => {
  const [text, setText] = useState("");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Comments — {task.title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-muted)", cursor: "pointer", display: "flex" }}><X size={18} /></button>
        </div>
        <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {task.comments?.length === 0 && <p style={{ color: "var(--color-muted)", fontSize: 13 }}>No comments yet.</p>}
          {task.comments?.map((c, i) => (
            <div key={i} style={{ background: "var(--color-bg)", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", marginBottom: 4 }}>{c.user?.name || "User"}</div>
              <p style={{ fontSize: 13, color: "var(--color-text)" }}>{c.text}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="form-input" placeholder="Write a comment…" value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { onAddComment(task._id, text); setText(""); } }} />
          <button className="btn-primary" onClick={() => { if (text.trim()) { onAddComment(task._id, text); setText(""); } }}>Post</button>
        </div>
      </div>
    </div>
  );
};

// ── Main Tasks Page ───────────────────────────────────────────────────────────
const Tasks = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter]   = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery]     = useState("");
  const [selectedTask, setSelectedTask]   = useState(null);
  const [commentTask, setCommentTask]     = useState(null);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get("/tasks");
      setTasks(data.tasks);
    } catch { toast.error("Failed to load tasks."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleUpdateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      toast.success("Status updated!");
      setSelectedTask(null);
      fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || "Update failed."); }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted.");
      fetchTasks();
    } catch { toast.error("Delete failed."); }
  };

  const handleAddComment = async (taskId, text) => {
    try {
      await api.post(`/tasks/${taskId}/comments`, { text });
      toast.success("Comment added!");
      // Refresh and re-open comment panel with updated data
      const { data } = await api.get(`/tasks/${taskId}`);
      setCommentTask(data.task);
      fetchTasks();
    } catch { toast.error("Comment failed."); }
  };

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = tasks.filter((t) => {
    const matchStatus   = statusFilter === "all"   || t.status   === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchSearch   = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar title="My Tasks" />

        <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Filters bar */}
          <div className="glass-card" style={{ padding: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
              <input className="form-input" placeholder="Search tasks…" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 36 }} />
            </div>

            {/* Status filter */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <SlidersHorizontal size={14} style={{ color: "var(--color-muted)" }} />
              {STATUSES.map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: "1px solid",
                  borderColor: statusFilter === s ? "var(--color-primary)" : "var(--color-border)",
                  background: statusFilter === s ? "rgba(124,58,237,0.2)" : "transparent",
                  color: statusFilter === s ? "#a78bfa" : "var(--color-muted)",
                  cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize"
                }}>{s}</button>
              ))}
            </div>

            {/* Priority filter */}
            <div style={{ display: "flex", gap: 6 }}>
              {PRIORITIES.map((p) => (
                <button key={p} onClick={() => setPriorityFilter(p)} style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: "1px solid",
                  borderColor: priorityFilter === p ? "var(--color-accent)" : "var(--color-border)",
                  background: priorityFilter === p ? "rgba(6,182,212,0.15)" : "transparent",
                  color: priorityFilter === p ? "var(--color-accent)" : "var(--color-muted)",
                  cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize"
                }}>{p}</button>
              ))}
            </div>
          </div>

          {/* Count */}
          <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
            Showing {filtered.length} of {tasks.length} tasks
          </p>

          {/* Task list */}
          {loading ? (
            <p style={{ color: "var(--color-muted)" }}>Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
              <p style={{ color: "var(--color-muted)" }}>No tasks match your filters.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {filtered.map((t) => (
                <div key={t._id}>
                  <TaskCard
                    task={t}
                    onEdit={!isAdmin ? () => setSelectedTask(t) : undefined}
                    onDelete={isAdmin ? handleDelete : undefined}
                  />
                  <button className="btn-secondary" style={{ width: "100%", justifyContent: "center", fontSize: 12, marginTop: 4 }}
                    onClick={() => setCommentTask(t)}>
                    💬 Comments ({t.comments?.length || 0})
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Status update modal (member) */}
      {selectedTask && !isAdmin && (
        <StatusModal task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={handleUpdateStatus} />
      )}

      {/* Comments panel */}
      {commentTask && (
        <CommentPanel task={commentTask} onClose={() => setCommentTask(null)} onAddComment={handleAddComment} />
      )}
    </div>
  );
};

export default Tasks;
