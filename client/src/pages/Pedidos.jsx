import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMisPedidos } from "../services/api";

/* ── Toast (mismo sistema que CrearPedido) ───────────────────── */
function Toast({ toasts, onClose }) {
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 1000, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
      {toasts.map(t => {
        const isError = t.tipo === "error";
        const bg      = isError ? "#fef2f2" : "#f0fdf4";
        const border  = isError ? "#fca5a5" : "#86efac";
        const color   = isError ? "#991b1b" : "#166534";
        return (
          <div key={t.id} style={{
            background: bg, border: `1px solid ${border}`, borderRadius: 16,
            padding: "14px 18px", minWidth: 260, maxWidth: 360,
            boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
            display: "flex", alignItems: "center", gap: 12,
            animation: "toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            fontFamily: "'Segoe UI', sans-serif", pointerEvents: "all",
          }}>
            <span style={{ fontSize: 18 }}>{isError ? "❌" : "✅"}</span>
            <p style={{ flex: 1, margin: 0, color, fontWeight: 600, fontSize: 14 }}>{t.msg}</p>
            <button onClick={() => onClose(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 15, padding: 0 }}>✕</button>
          </div>
        );
      })}
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(14px) scale(0.95)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = (msg, tipo = "ok") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, tipo }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };
  const remove = id => setToasts(prev => prev.filter(t => t.id !== id));
  return { toasts, push, remove };
}

/* ── Estado badge config ─────────────────────────────────────── */
const ESTADO_CFG = {
  "PENDIENTE":  { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", dot: "#f59e0b" },
  "EN PROCESO": { bg: "#eff6ff", color: "#2563eb", border: "#93c5fd", dot: "#3b82f6" },
  "FINALIZADO": { bg: "#f0fdf4", color: "#16a34a", border: "#86efac", dot: "#22c55e" },
  "CANCELADO":  { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", dot: "#ef4444" },
};

const defaultCfg = { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb", dot: "#9ca3af" };

/* ── Skeleton loader ─────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: "#fff", borderRadius: 18, padding: "20px 24px",
          border: "1px solid #ececec", display: "flex", alignItems: "center",
          gap: 18, animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite`,
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f3f4f6", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 14, borderRadius: 6, background: "#f3f4f6", marginBottom: 8, width: "50%" }} />
            <div style={{ height: 11, borderRadius: 6, background: "#f3f4f6", width: "30%" }} />
          </div>
          <div style={{ height: 26, width: 90, borderRadius: 20, background: "#f3f4f6" }} />
        </div>
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function Pedidos() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [filter,  setFilter]  = useState("TODOS");
  const navigate  = useNavigate();
  const { toasts, push, remove: removeToast } = useToasts();

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true); setError("");
      const rows = await getMisPedidos();
      setData(rows || []);
    } catch (e) {
      setError(e.message || "Error al cargar pedidos");
      push(e.message || "Error al cargar pedidos", "error");
    } finally {
      setLoading(false);
    }
  };

  const estados = ["TODOS", ...Object.keys(ESTADO_CFG)];
  const filtrados = filter === "TODOS" ? data : data.filter(p => p.nombre_estado === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9", fontFamily: "'Segoe UI', sans-serif", padding: "48px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: "clamp(2rem,5vw,2.8rem)", fontWeight: 700, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Mis <span style={{ color: "#c40000" }}>pedidos</span>
          </h1>
          {!loading && !error && (
            <p style={{ color: "#6b7280", margin: 0, fontSize: 15 }}>
              {data.length} pedido{data.length !== 1 ? "s" : ""} en total
            </p>
          )}
        </div>

        {/* Filtros por estado */}
        {!loading && !error && data.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {estados.map(e => {
              const active = filter === e;
              const cfg = ESTADO_CFG[e] || defaultCfg;
              return (
                <button key={e} onClick={() => setFilter(e)} style={{
                  padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s",
                  background: active ? (e === "TODOS" ? "#111827" : cfg.bg) : "#fff",
                  color: active ? (e === "TODOS" ? "#fff" : cfg.color) : "#6b7280",
                  border: active ? `1px solid ${e === "TODOS" ? "#111827" : cfg.border}` : "1px solid #e5e7eb",
                  letterSpacing: "0.04em",
                }}>
                  {e === "TODOS" ? `Todos (${data.length})` : (() => {
                    const count = data.filter(p => p.nombre_estado === e).length;
                    return `${e} (${count})`;
                  })()}
                </button>
              );
            })}
          </div>
        )}

        {/* States */}
        {loading && <Skeleton />}

        {error && !loading && (
          <div style={{ textAlign: "center", padding: "40px 24px", background: "#fff5f5", borderRadius: 18, border: "1px solid #fecaca" }}>
            <span style={{ fontSize: 32, display: "block", marginBottom: 10 }}>⚠️</span>
            <p style={{ color: "#c40000", margin: "0 0 16px", fontWeight: 600 }}>{error}</p>
            <button onClick={cargar} style={{ background: "#c40000", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600 }}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", background: "#fff", borderRadius: 22, boxShadow: "0 10px 30px rgba(0,0,0,0.06)", border: "1px solid #ececec" }}>
            <span style={{ fontSize: 56, display: "block", marginBottom: 16 }}>📦</span>
            <p style={{ color: "#9ca3af", fontSize: 17, margin: 0 }}>No tienes pedidos aún</p>
          </div>
        )}

        {!loading && !error && filtrados.length === 0 && data.length > 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af", fontSize: 15 }}>
            No hay pedidos con estado <b>{filter}</b>
          </div>
        )}

        {!loading && !error && filtrados.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtrados.map((p, i) => {
              const cfg = ESTADO_CFG[p.nombre_estado] || defaultCfg;
              return (
                <div key={p.id_pedido}
                  onClick={() => navigate(`/pedido/${p.id_pedido}`)}
                  style={{
                    background: "#fff", borderRadius: 18, padding: "18px 22px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #ececec",
                    display: "flex", alignItems: "center", gap: 18, cursor: "pointer",
                    transition: "box-shadow 0.2s, transform 0.15s",
                    flexWrap: "wrap",
                    animation: `slideIn 0.3s ease ${i * 0.05}s both`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "none"; }}
                >
                  {/* ID box */}
                  <div style={{ width: 52, height: 52, background: "#fff5f5", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #fecaca" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#c40000", letterSpacing: "0.03em" }}>#{p.id_pedido}</span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <h3 style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 600, color: "#111827" }}>
                      Pedido #{p.id_pedido}
                    </h3>
                    <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                      {new Date(p.fecha_creacion).toLocaleString("es-CO", {
                        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>

                  {/* Estado badge con dot */}
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.05em", background: cfg.bg, color: cfg.color,
                    border: `1px solid ${cfg.border}`, whiteSpace: "nowrap",
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
                    {p.nombre_estado}
                  </span>

                  {/* Arrow */}
                  <span style={{ color: "#d1d5db", fontSize: 18, flexShrink: 0 }}>→</span>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
      <Toast toasts={toasts} onClose={removeToast} />
    </div>
  );
}