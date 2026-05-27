// pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getResumen,
  getTopRepuestos,
  getPedidosPorDia,
  getStockAnalytics,
  getPedidos,
} from "../../services/api";
import EstadoBadge from "../../components/EstadoBadge";

const ACENTO = "#7c3aed";

function StatCard({ icon, label, value, color, onClick, sub }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "22px 20px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        border: "1px solid #e2e8f0",
        borderTop: `4px solid ${color}`,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s, box-shadow 0.15s",
        textAlign: "center",
      }}
      onClick={onClick}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform = "translateY(-3px)")}
      onMouseLeave={e => onClick && (e.currentTarget.style.transform = "none")}
    >
      <div style={{ fontSize: 30, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1 }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function QuickLink({ icon, label, desc, color, to }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "18px 20px",
        border: `1px solid ${color}33`,
        borderLeft: `4px solid ${color}`,
        cursor: "pointer",
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
      onClick={() => navigate(to)}
      onMouseEnter={e => { e.currentTarget.style.background = `${color}08`; e.currentTarget.style.transform = "translateX(4px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "none"; }}
    >
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15 }}>{label}</div>
        <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{desc}</div>
      </div>
      <span style={{ marginLeft: "auto", color, fontSize: 20 }}>→</span>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate    = useNavigate();
  const [resumen,   setResumen]   = useState(null);
  const [recientes, setRecientes] = useState([]);
  const [alertas,   setAlertas]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setError("");
      const [r, pedidosList, stockList] = await Promise.all([
        getResumen(),
        getPedidos({ limite: 8 }),
        getStockAnalytics(),
      ]);
      setResumen(r);
      setRecientes(pedidosList?.slice(0, 8) || []);

      // Alertas automáticas
      const alerts = [];
      const bajoStock = (stockList || []).filter(x => x.stock <= 5);
      if (bajoStock.length) {
        alerts.push({
          tipo: "danger",
          icon: "⚠️",
          texto: `${bajoStock.length} repuesto(s) con stock crítico (≤ 5 unidades)`,
          accion: () => navigate("/admin/repuestos"),
          label: "Ver repuestos",
        });
      }
      if (r?.pendientes > 0) {
        alerts.push({
          tipo: "warning",
          icon: "⏳",
          texto: `${r.pendientes} pedido(s) pendientes de atención`,
          accion: () => navigate("/admin/pedidos"),
          label: "Ver pedidos",
        });
      }
      if (r?.pedidos_hoy > 0) {
        alerts.push({
          tipo: "info",
          icon: "📦",
          texto: `${r.pedidos_hoy} pedido(s) creados hoy`,
        });
      }
      setAlertas(alerts);
    } catch (e) {
      setError(e.message || "Error al cargar dashboard");
    } finally {
      setLoading(false);
    }
  };

  const estadoLabel = { 1: "PENDIENTE", 2: "EN PROCESO", 3: "FINALIZADO", 4: "CANCELADO" };

  const alertStyle = {
    danger:  { bg: "#fef2f2", border: "#fca5a5", color: "#991b1b" },
    warning: { bg: "#fffbeb", border: "#fcd34d", color: "#92400e" },
    info:    { bg: "#eff6ff", border: "#93c5fd", color: "#1e40af" },
  };

  if (loading) return <div style={s.center}>Cargando dashboard...</div>;
  if (error)   return <div style={{ ...s.center, color: "#ef4444" }}>{error}</div>;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Panel Administrador</h1>
          <p style={s.sub}>Resumen general del sistema · {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <button style={s.btnRefresh} onClick={cargar}>Actualizar</button>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {alertas.map((a, i) => {
            const al = alertStyle[a.tipo];
            return (
              <div key={i} style={{
                background: al.bg,
                border: `1px solid ${al.border}`,
                borderRadius: 10,
                padding: "12px 18px",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: al.color,
                fontSize: 14,
                fontWeight: 600,
              }}>
                <span>{a.icon}</span>
                <span style={{ flex: 1 }}>{a.texto}</span>
                {a.accion && (
                  <button
                    onClick={a.accion}
                    style={{ background: al.color, color: "#fff", border: "none", padding: "5px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                  >
                    {a.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stat cards */}
      <div style={s.cards}>
        <StatCard icon="📦" label="Total pedidos"   value={resumen?.total}      color={ACENTO}    onClick={() => navigate("/admin/pedidos")} />
        <StatCard icon="⏳" label="Pendientes"       value={resumen?.pendientes} color="#f59e0b"   onClick={() => navigate("/admin/pedidos")} />
        <StatCard icon="⚙️" label="En proceso"       value={resumen?.en_proceso} color="#3b82f6"   onClick={() => navigate("/admin/pedidos")} />
        <StatCard icon="✅" label="Finalizados"       value={resumen?.finalizados} color="#10b981"  onClick={() => navigate("/admin/pedidos")} />
        <StatCard icon="❌" label="Cancelados"        value={resumen?.cancelados} color="#ef4444"   onClick={() => navigate("/admin/pedidos")} />
        <StatCard icon="🛎️" label="Pedidos hoy"      value={resumen?.pedidos_hoy} color="#8b5cf6"  sub="Creados hoy" />
        <StatCard icon="⚠️" label="Stock bajo"       value={resumen?.repuestos_bajo_stock} color="#f97316" onClick={() => navigate("/admin/repuestos")} sub="≤ 5 uds" />
      </div>

      <div style={s.row2}>
        {/* Actividad reciente */}
        <div style={s.panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={s.panelTitle}>Actividad reciente</h3>
            <button style={s.btnSm} onClick={() => navigate("/admin/pedidos")}>Ver todos →</button>
          </div>
          {recientes.length === 0 ? (
            <p style={s.empty}>Sin pedidos recientes</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {recientes.map(p => (
                <div
                  key={p.id_pedido}
                  style={s.actRow}
                  onClick={() => navigate(`/pedido/${p.id_pedido}`)}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, color: ACENTO }}>#{p.id_pedido}</span>
                    <span style={{ color: "#64748b", fontSize: 13, marginLeft: 10 }}>
                      {p.cliente_nombre || "Cliente"}
                    </span>
                  </div>
                  <EstadoBadge estado={p.nombre_estado || estadoLabel[p.id_estado]} />
                  <span style={{ color: "#94a3b8", fontSize: 12, marginLeft: 12 }}>
                    {new Date(p.fecha_creacion).toLocaleDateString("es-CO")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accesos rápidos */}
        <div style={s.panel}>
          <h3 style={s.panelTitle}>Accesos rápidos</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <QuickLink icon="📋" label="Gestionar pedidos"  desc="Ver, editar y cambiar estados" color="#7c3aed" to="/admin/pedidos"   />
            <QuickLink icon="👥" label="Gestionar usuarios" desc="CRUD completo de usuarios"     color="#0ea5e9" to="/admin/usuarios"  />
            <QuickLink icon="🔧" label="Gestionar repuestos" desc="Stock, precios y catálogo"    color="#10b981" to="/admin/repuestos" />
            <QuickLink icon="📊" label="Analytics globales" desc="Métricas y tendencias"         color="#f59e0b" to="/admin/analytics" />
            <QuickLink icon="⏰" label="Gestión de turnos"  desc="Asignar operadores por horario" color="#8b5cf6" to="/admin/turnos"    />
          </div>
        </div>
      </div>

      {/* Resumen operativo */}
      <div style={s.panel}>
        <h3 style={s.panelTitle}>Resumen operativo</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            {
              label: "Tasa de cancelación",
              value: resumen?.total > 0
                ? `${((resumen.cancelados / resumen.total) * 100).toFixed(1)}%`
                : "0%",
              color: "#ef4444",
              icon: "❌",
            },
            {
              label: "Tasa de finalización",
              value: resumen?.total > 0
                ? `${((resumen.finalizados / resumen.total) * 100).toFixed(1)}%`
                : "0%",
              color: "#10b981",
              icon: "✅",
            },
            {
              label: "Pedidos activos",
              value: (resumen?.pendientes || 0) + (resumen?.en_proceso || 0),
              color: "#3b82f6",
              icon: "🔄",
            },
          ].map(item => (
            <div key={item.label} style={{
              background: `${item.color}0d`,
              border: `1px solid ${item.color}33`,
              borderRadius: 12,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}>
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: item.color }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page:       { padding: "30px 36px", maxWidth: 1300, margin: "auto" },
  center:     { textAlign: "center", padding: 80, color: "#64748b", fontSize: 18 },
  header:     { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 },
  title:      { margin: 0, fontSize: "1.9rem", color: "#7c3aed", fontWeight: 900 },
  sub:        { margin: "5px 0 0", color: "#64748b", fontSize: 14 },
  btnRefresh: { background: "#7c3aed", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 9, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  cards:      { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 },
  row2:       { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20, marginBottom: 20 },
  panel:      { background: "#fff", borderRadius: 16, padding: "24px 22px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0", marginBottom: 20 },
  panelTitle: { margin: "0 0 0", fontSize: 16, fontWeight: 800, color: "#1e293b" },
  btnSm:      { background: "#f1f5f9", color: "#7c3aed", border: "1px solid #e2e8f0", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },
  actRow:     { display: "flex", alignItems: "center", padding: "11px 4px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.1s", borderRadius: 8 },
  empty:      { color: "#94a3b8", fontStyle: "italic", textAlign: "center", padding: 20 },
};