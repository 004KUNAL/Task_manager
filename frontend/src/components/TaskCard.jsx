import { format } from "date-fns";
import { Calendar, User, Flag, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const priorityColor = { high: "var(--color-danger)", medium: "var(--color-warning)", low: "var(--color-success)" };
const statusClass   = { todo: "badge-todo", "in-progress": "badge-progress", done: "badge-done" };
const statusLabel   = { todo: "Todo", "in-progress": "In Progress", done: "Done" };

/**
 * TaskCard — displayed in the Kanban board and task list.
 * Props: task, onEdit, onDelete (optional, admin only), onClaim
 */
const TaskCard = ({ task, onEdit, onDelete, onClaim }) => {
  const { isAdmin, user } = useAuth();
  const isOverdue =
    task.deadline &&
    task.status !== "done" &&
    new Date() > new Date(task.deadline);

  // A task can be claimed if:
  // 1. User is a Member (not Admin)
  // 2. The claim function was passed down
  // 3. The task is either unassigned OR assigned to someone else (not the current user)
  const taskAssigneeId = task.assignedTo?._id || task.assignedTo;
  const currentUserId  = user?._id;
  const canClaim = !isAdmin && onClaim && (taskAssigneeId !== currentUserId);

  return (
    <div className="glass-card fade-in" style={{
      padding: "16px", marginBottom: 10, cursor: "pointer",
      transition: "border-color 0.2s, transform 0.2s",
      borderLeft: `3px solid ${priorityColor[task.priority] || "var(--color-border)"}`,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderLeftColor = "var(--color-primary)"; e.currentTarget.style.transform = "translateX(3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderLeftColor = priorityColor[task.priority]; e.currentTarget.style.transform = "translateX(0)"; }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", flex: 1, marginRight: 8 }}>
          {task.title}
        </h4>
        <span className={`badge ${statusClass[task.status]}`}>
          {statusLabel[task.status]}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 12, lineHeight: 1.5 }}>
          {task.description.length > 80 ? task.description.slice(0, 80) + "…" : task.description}
        </p>
      )}

      {/* Meta row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
        {task.assignedTo && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-muted)" }}>
            <User size={12} /> {task.assignedTo.name}
          </div>
        )}
        {task.deadline && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4, fontSize: 11,
            color: isOverdue ? "var(--color-danger)" : "var(--color-muted)"
          }}>
            <Calendar size={12} />
            {format(new Date(task.deadline), "MMM d, yyyy")}
            {isOverdue && " ⚠"}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-muted)" }}>
          <Flag size={12} />
          <span className={`badge badge-${task.priority}`} style={{ padding: "1px 6px", fontSize: 10 }}>
            {task.priority}
          </span>
        </div>
        {task.comments?.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-muted)" }}>
            <MessageSquare size={12} /> {task.comments.length}
          </div>
        )}
      </div>

      {/* Action buttons */}
      {(onEdit || onDelete || canClaim) && (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {canClaim && (
            <button
              onClick={(e) => { e.stopPropagation(); onClaim(task._id); }}
              className="btn-primary"
              style={{ 
                padding: "6px 12px", 
                fontSize: "11px", 
                fontWeight: "700",
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none",
                boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
              }}
            >
              Accept Task
            </button>
          )}
          {onEdit && (
            <button className="btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }}
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
              Edit
            </button>
          )}
          {onDelete && (
            <button className="btn-danger" style={{ padding: "4px 10px", fontSize: 12 }}
              onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
