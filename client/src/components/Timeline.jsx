// ─────────────────────────────────────────────────────────────────────────────
// components/Timeline.jsx  ─  Timeline visual del historial de estados
// ─────────────────────────────────────────────────────────────────────────────

const ESTADO_COLOR = {
  "PENDIENTE":  "#f59e0b",
  "EN PROCESO": "#3b82f6",
  "FINALIZADO": "#10b981",
  "CANCELADO":  "#ef4444",
};

const ESTADO_ICON = {
  "PENDIENTE":  "⏳",
  "EN PROCESO": "⚙️",
  "FINALIZADO": "✅",
  "CANCELADO":  "❌",
};

export default function Timeline({ historial = [] }) {
  if (!historial.length) {
    return <p style={{ color: "#999", fontStyle: "italic" }}>Sin historial disponible.</p>;
  }

  return (
    <div style={{ position: "relative", paddingLeft: 32, marginTop: 16 }}>
      {/* Línea vertical */}
      <div style={{
        position: "absolute",
        left: 11,
        top: 8,
        bottom: 8,
        width: 2,
        background: "#e5e7eb",
        borderRadius: 2,
      }} />

      {historial.map((h, i) => {
        const nuevoColor = ESTADO_COLOR[h.estado_nuevo] || "#6b7280";
        const isLast = i === historial.length - 1;

        return (
          <div key={h.id_historial} style={{ position: "relative", marginBottom: isLast ? 0 : 28 }}>
            {/* Dot */}
            <div style={{
              position: "absolute",
              left: -21,
              top: 6,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: nuevoColor,
              border: "3px solid #fff",
              boxShadow: `0 0 0 2px ${nuevoColor}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
            }} />

            {/* Card */}
            <div style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderLeft: `3px solid ${nuevoColor}`,
              borderRadius: 10,
              padding: "10px 14px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>{ESTADO_ICON[h.estado_nuevo] || "📌"}</span>
                <div>
                  <span style={{ fontWeight: 700, color: nuevoColor, fontSize: 14 }}>
                    {h.estado_nuevo || "Creado"}
                  </span>
                  {h.estado_anterior && (
                    <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 6 }}>
                      ← desde {h.estado_anterior}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                <span>👤 {h.usuario}</span>
                <span style={{ marginLeft: 12 }}>
                  🕐 {new Date(h.fecha_cambio).toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}