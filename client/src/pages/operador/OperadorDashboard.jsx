// pages/operador/OperadorDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResumen } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

export default function OperadorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumen, setResumen] = useState(null);
  const [error, setError]     = useState("");

  useEffect(() => {
    getResumen()
      .then(setResumen)
      .catch(() => setError("No se pudo cargar el resumen"));
  }, []);

  const cards = resumen
    ? [
        { label: "Total pedidos",    valor: resumen.total,                 color: "#6366f1", icon: "📦" },
        { label: "Pendientes",       valor: resumen.pendientes,            color: "#f59e0b", icon: "⏳" },
        { label: "En proceso",       valor: resumen.en_proceso,            color: "#3b82f6", icon: "⚙️"  },
        { label: "Finalizados",      valor: resumen.finalizados,           color: "#10b981", icon: "✅" },
        { label: "Cancelados",       valor: resumen.cancelados,            color: "#ef4444", icon: "❌" },
        { label: "Pedidos hoy",      valor: resumen.pedidos_hoy,           color: "#8b5cf6", icon: "📅" },
        { label: "Stock bajo (≤5)",  valor: resumen.repuestos_bajo_stock,  color: "#f97316", icon: "⚠️" },
      ]
    : [];

  const quickLinks = [
    { label: "📋 Ver pedidos",       to: "/operador/pedidos"        },
    { label: "➕ Crear pedido",       to: "/operador/pedidos/nuevo"  },
    { label: "🔧 Gestionar repuestos", to: "/operador/repuestos"    },
    { label: "📊 Analytics",          to: "/operador/analytics"     },
  ];

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Panel Operador</h1>
          <p style={s.sub}>Bienvenido, <strong>{user?.nombre}</strong></p>
        </div>
        <button style={s.btnPrimary} onClick={() => navigate("/operador/pedidos/nuevo")}>
          + Nuevo pedido
        </button>
      </div>

      {error && <p style={s.error}>{error}</p>}

      {/* Alerta stock bajo */}
      {resumen?.repuestos_bajo_stock > 0 && (
        <div style={s.alertStock}>
          <span>⚠️</span>
          <span style={{ flex: 1 }}>
            <strong>{resumen.repuestos_bajo_stock}</strong> repuesto(s) con stock crítico (≤ 5 unidades)
          </span>
          <button style={s.alertBtn} onClick={() => navigate("/operador/repuestos")}>
            Ver repuestos
          </button>
        </div>
      )}

      {/* Cards resumen */}
      <div style={s.grid}>
        {resumen === null && !error
          ? Array(7).fill(0).map((_, i) => (
              <div key={i} style={{ ...s.card, background: "#f3f4f6", height: 100 }} />
            ))
          : cards.map((c) => (
              <div key={c.label} style={{ ...s.card, borderTop: `4px solid ${c.color}` }}>
                <span style={{ fontSize: 28 }}>{c.icon}</span>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.valor ?? "—"}</div>
                  <div style={s.cardLabel}>{c.label}</div>
                </div>
              </div>
            ))}
      </div>

      {/* Accesos rápidos */}
      <h2 style={s.sectionTitle}>Accesos rápidos</h2>
      <div style={s.quickGrid}>
        {quickLinks.map((item) => (
          <button key={item.to} style={s.quickBtn} onClick={() => navigate(item.to)}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const s = {
  page:         { padding: "30px 36px", maxWidth: 1100, margin: "auto" },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30, flexWrap: "wrap", gap: 16 },
  title:        { margin: 0, fontSize: "1.9rem", color: "#0ea5e9", fontWeight: 800 },
  sub:          { margin: "4px 0 0", color: "#64748b", fontSize: 15 },
  btnPrimary:   { background: "#0ea5e9", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 15 },
  error:        { color: "#ef4444", background: "#fef2f2", padding: "10px 16px", borderRadius: 8, marginBottom: 20 },
  alertStock:   { display: "flex", alignItems: "center", gap: 12, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "12px 18px", marginBottom: 20, color: "#9a3412", fontSize: 14, fontWeight: 600 },
  alertBtn:     { background: "#f97316", color: "#fff", border: "none", padding: "5px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 },
  grid:         { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 16, marginBottom: 36 },
  card:         { background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 4 },
  cardLabel:    { fontSize: 13, color: "#64748b", marginTop: 2, fontWeight: 500 },
  sectionTitle: { fontSize: "1.1rem", fontWeight: 700, color: "#334155", marginBottom: 14 },
  quickGrid:    { display: "flex", gap: 14, flexWrap: "wrap" },
  quickBtn:     { background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#334155", padding: "12px 22px", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 14, transition: "all .15s" },
};