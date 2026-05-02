/**
 * StatCard — a glowing metric card used on the Dashboard.
 * Props: title, value, icon (ReactNode), color (CSS var string), subtitle
 */
const StatCard = ({ title, value, icon, color = "var(--color-primary)", subtitle }) => {
  return (
    <div className="glass-card stat-card fade-in" style={{
      padding: "24px", display: "flex", flexDirection: "column", gap: 12,
      transition: "transform 0.2s, box-shadow 0.2s", cursor: "default",
      borderTop: `3px solid ${color}`
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {title}
        </span>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: color
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{subtitle}</div>
      )}
    </div>
  );
};

export default StatCard;
