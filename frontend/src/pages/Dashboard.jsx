import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import KanbanBoard from "../components/KanbanBoard";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  CheckSquare, Clock, AlertTriangle, ListTodo, BarChart2, RefreshCw, Plus, Folder
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats]   = useState({ total: 0, completed: 0, inProgress: 0, todo: 0, overdue: 0 });
  const [tasks, setTasks]   = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // For Editing from Dashboard
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);
  const [projects, setProjects]   = useState([]);
  const [users, setUsers]         = useState([]);

  // For Members to update status from Dashboard
  const [memberModalTask, setMemberModalTask] = useState(null);

  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const [statsRes, tasksRes, projRes, userRes] = await Promise.all([
        api.get("/tasks/stats"),
        api.get("/tasks"),
        api.get("/projects"),
        isAdmin ? api.get("/users") : Promise.resolve({ data: { users: [] } }),
      ]);

      setStats(statsRes.data.stats);
      setTasks(tasksRes.data.tasks);
      setProjects(projRes.data.projects);
      setUsers(userRes.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
    // ── Auto-Sync ──
    // Poll every 30 seconds to catch new assignments or status changes from other users
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleClaimTask = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}/claim`);
      toast.success("Task claimed! It's now in your todo list.");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Claim failed.");
    }
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
      fetchData(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success("Status updated!");
      setMemberModalTask(null);
      fetchData(true); // Update charts and stats immediately
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted.");
      fetchData(true);
    } catch {
      toast.error("Delete failed.");
    }
  };

  // ── Filter tasks ─────────────────────────────────────────────────────────
  const filteredTasks = tasks.filter((t) => {
    if (filter === "overdue") return t.deadline && t.status !== "done" && new Date() > new Date(t.deadline);
    if (filter === "all") return true;
    return t.status === filter;
  });

  // ── Chart data ───────────────────────────────────────────────────────────
  const doughnutData = {
    labels: ["Done", "In Progress", "Todo"],
    datasets: [{
      data: [stats.completed, stats.inProgress, stats.todo],
      backgroundColor: ["#10b981", "#06b6d4", "#8b949e"],
      borderWidth: 0, hoverOffset: 6
    }]
  };

  const barData = {
    labels: ["Total", "Done", "In Progress", "Todo", "Overdue"],
    datasets: [{
      label: "Tasks",
      data: [stats.total, stats.completed, stats.inProgress, stats.todo, stats.overdue],
      backgroundColor: [
        "rgba(124,58,237,0.7)", "rgba(16,185,129,0.7)", "rgba(6,182,212,0.7)",
        "rgba(139,148,158,0.7)", "rgba(239,68,68,0.7)"
      ],
      borderRadius: 6, borderSkipped: false,
    }]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#8b949e", font: { size: 12 } } } },
    scales: {
      x: { ticks: { color: "#8b949e" }, grid: { color: "rgba(48,54,61,0.5)" } },
      y: { ticks: { color: "#8b949e" }, grid: { color: "rgba(48,54,61,0.5)" }, beginAtZero: true }
    }
  };

  if (loading) return (
    <div style={{ display: "flex", height: "100vh", background: "var(--color-bg)" }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--color-muted)" }}>Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar title="Dashboard" />

        <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 28 }}>
          {/* ── Header with Refresh ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Overview</h2>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-secondary" onClick={() => fetchData(true)} disabled={refreshing}>
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Syncing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <StatCard title="Total Projects" value={stats.totalProjects || 0} icon={<Folder size={20}/>} color="var(--color-primary)" subtitle="Active projects" />
            <StatCard title="Total Tasks"   value={stats.total}     icon={<ListTodo size={20}/>}     color="var(--color-accent)"  subtitle="All active tasks" />
            <StatCard title="Completed"     value={stats.completed} icon={<CheckSquare size={20}/>}  color="var(--color-success)" subtitle="Tasks marked done" />
            <StatCard title="In Progress"   value={stats.inProgress}icon={<Clock size={20}/>}        color="var(--color-warning)" subtitle="Currently active" />
            <StatCard title="Overdue"       value={stats.overdue}   icon={<AlertTriangle size={20}/>}color="var(--color-danger)"  subtitle="Past deadline" />
          </div>

          {/* ── Charts ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart2 size={16} style={{ color: "var(--color-primary)" }} /> Task Distribution
              </h3>
              <div style={{ height: 200 }}>
                <Doughnut data={doughnutData} options={{ ...chartOptions, scales: undefined }} />
              </div>
            </div>
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart2 size={16} style={{ color: "var(--color-primary)" }} /> Task Overview
              </h3>
              <div style={{ height: 200 }}>
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* ── Kanban Board ── */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Task Board</h3>
              {/* Filter tabs */}
              <div style={{ display: "flex", gap: 8 }}>
                {["all", "todo", "in-progress", "done", "overdue"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    border: "1px solid",
                    borderColor: filter === f ? "var(--color-primary)" : "var(--color-border)",
                    background: filter === f ? "rgba(124,58,237,0.2)" : "transparent",
                    color: filter === f ? "#a78bfa" : "var(--color-muted)",
                    cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s"
                  }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <KanbanBoard 
              tasks={filteredTasks} 
              onEdit={isAdmin ? (t) => { setEditTask(t); setShowModal(true); } : (t) => { setMemberModalTask(t); }} 
              onDelete={isAdmin ? handleDeleteTask : null} 
              onClaim={handleClaimTask}
            />
          </div>
        </main>
      </div>

      {/* Task Modal for Admin Editing from Dashboard */}
      {showModal && isAdmin && (
        <TaskModalWrapper 
          task={editTask} 
          projects={projects}
          users={users}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={handleSaveTask}
        />
      )}

      {/* Member Quick Status Update Modal */}
      {memberModalTask && (
        <div className="modal-overlay" onClick={() => setMemberModalTask(null)}>
          <div className="modal-box" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Update Status</h2>
            <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 16 }}>{memberModalTask.title}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["todo", "in-progress", "done"].map((s) => (
                <button key={s} className="btn-secondary" style={{
                  justifyContent: "center",
                  borderColor: memberModalTask.status === s ? "var(--color-primary)" : undefined
                }} onClick={() => handleStatusUpdate(memberModalTask._id, s)}>
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

// Internal wrapper for TaskModal to avoid import issues or missing exports
const TaskModalWrapper = ({ task, projects, users, onClose, onSave }) => {
  const [form, setForm] = useState({
    title:       task?.title || "",
    description: task?.description || "",
    projectId:   task?.project?._id || task?.project || "",
    assignedTo:  task?.assignedTo?._id || task?.assignedTo || "",
    status:      task?.status || "todo",
    priority:    task?.priority || "medium",
    deadline:    task?.deadline ? task.deadline.slice(0, 10) : "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required.");
    if (!form.projectId) return toast.error("Project is required.");
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{task ? "Edit Task" : "New Task"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-muted)", cursor: "pointer", display: "flex" }}>
            <Plus size={20} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="form-label">Task Title *</label>
            <input className="form-input" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <label className="form-label">Project *</label>
            <select className="form-input" value={form.projectId} onChange={(e) => setForm({...form, projectId: e.target.value})}>
              <option value="">Select Project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">Assignee</label>
              <select className="form-input" value={form.assignedTo} onChange={(e) => setForm({...form, assignedTo: e.target.value})}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="form-label">Deadline</label>
              <input className="form-input" type="date" value={form.deadline} onChange={(e) => setForm({...form, deadline: e.target.value})} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
