import TaskCard from "./TaskCard";

/**
 * KanbanBoard — splits tasks into 3 columns by status.
 * Props: tasks[], onEdit, onDelete, onClaim
 */
const KanbanBoard = ({ tasks = [], onEdit, onDelete, onClaim }) => {
  const columns = [
    { id: "todo", title: "To Do", color: "var(--color-muted)" },
    { id: "in-progress", title: "In Progress", color: "var(--color-accent)" },
    { id: "done", title: "Done", color: "var(--color-success)" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div key={col.id} className="kanban-column" style={{ 
            background: "rgba(255,255,255,0.02)", 
            borderRadius: 12, 
            padding: 16, 
            minHeight: 400,
            borderTop: `3px solid ${col.color}`
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {col.title} ({colTasks.length})
              </h4>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {colTasks.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--color-muted)", fontSize: 12, marginTop: 40 }}>No tasks</p>
              ) : (
                colTasks.map((task) => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                    onClaim={onClaim} 
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
