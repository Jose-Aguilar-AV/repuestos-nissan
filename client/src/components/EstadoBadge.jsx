// components/EstadoBadge.jsx
const COLORES = {
  "PENDIENTE":  { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
  "EN PROCESO": { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
  "FINALIZADO": { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },
  "CANCELADO":  { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
};

export default function EstadoBadge({ estado }) {
  const c = COLORES[estado] || { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" };
  return (
    <span style={{
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      padding: "3px 10px",
      borderRadius: 20,
      fontWeight: 700,
      fontSize: 12,
      whiteSpace: "nowrap",
    }}>
      {estado}
    </span>
  );
}