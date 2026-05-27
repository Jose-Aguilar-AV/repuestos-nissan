import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPedido, actualizarPedido, cancelarPedido, getHistorialPedido } from "../services/api";

/* ── Toast System ────────────────────────────────────────────── */
function Toast({ toasts, onClose }) {
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 1000, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
      {toasts.map(t => {
        const isError = t.tipo === "error";
        const isWarn  = t.tipo === "warn";
        const bg      = isError ? "#fef2f2" : isWarn ? "#fffbeb" : "#f0fdf4";
        const border  = isError ? "#fca5a5" : isWarn ? "#fcd34d" : "#86efac";
        const color   = isError ? "#991b1b" : isWarn ? "#92400e" : "#166534";
        const icon    = isError ? "❌" : isWarn ? "⚠️" : "✅";
        return (
          <div key={t.id} style={{
            background: bg, border: `1px solid ${border}`, borderRadius: 16,
            padding: "14px 18px", minWidth: 260, maxWidth: 360,
            boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
            display: "flex", alignItems: "flex-start", gap: 12,
            animation: "toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            fontFamily: "'Segoe UI', sans-serif", pointerEvents: "all",
          }}>
            <span style={{ fontSize: 18, lineHeight: 1.4 }}>{icon}</span>
            <p style={{ flex: 1, margin: 0, color, fontWeight: 600, fontSize: 14, lineHeight: 1.5 }}>{t.msg}</p>
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

/* ── Confirm Modal ───────────────────────────────────────────── */
function ConfirmModal({ open, title, message, confirmLabel, confirmColor, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 998 }}
      onClick={onCancel}
    >
      <div
        style={{ background: "#fff", borderRadius: 22, padding: 32, width: 360, boxShadow: "0 24px 64px rgba(0,0,0,0.14)", animation: "popIn 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#111827" }}>{title}</h3>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: confirmColor || "#c40000", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {confirmLabel || "Confirmar"}
          </button>
        </div>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

/* ── Estado config ───────────────────────────────────────────── */
const ESTADOS = { 1: "PENDIENTE", 2: "EN PROCESO", 3: "FINALIZADO", 4: "CANCELADO" };

const ESTADO_CFG = {
  1: { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", dot: "#f59e0b" },
  2: { bg: "#eff6ff", color: "#2563eb", border: "#93c5fd", dot: "#3b82f6" },
  3: { bg: "#f0fdf4", color: "#16a34a", border: "#86efac", dot: "#22c55e" },
  4: { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", dot: "#ef4444" },
};

/* ── Progress bar steps ──────────────────────────────────────── */
function ProgressSteps({ estado }) {
  const steps = [
    { id: 1, label: "Pendiente" },
    { id: 2, label: "En proceso" },
    { id: 3, label: "Finalizado" },
  ];
  const cancelled = estado === 4;

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {steps.map((step, i) => {
          const done    = !cancelled && estado >= step.id;
          const current = !cancelled && estado === step.id;
          return (
            <div key={step.id} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
              {/* Circle */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: done ? (step.id === 3 ? "#16a34a" : "#c40000") : "#f3f4f6",
                  border: `2px solid ${done ? (step.id === 3 ? "#16a34a" : "#c40000") : current ? "#c40000" : "#e5e7eb"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s",
                  boxShadow: current ? "0 0 0 4px rgba(196,0,0,0.12)" : "none",
                }}>
                  {done
                    ? <span style={{ color: "#fff", fontSize: 16 }}>{step.id === 3 ? "✓" : step.id}</span>
                    : <span style={{ color: current ? "#c40000" : "#9ca3af", fontSize: 13, fontWeight: 700 }}>{step.id}</span>
                  }
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: done ? (step.id === 3 ? "#16a34a" : "#c40000") : "#9ca3af", whiteSpace: "nowrap" }}>
                  {step.label}
                </span>
              </div>
              {/* Connector */}
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 3, marginBottom: 22, background: !cancelled && estado > step.id ? "linear-gradient(90deg,#c40000,#c40000)" : "#e5e7eb", transition: "background 0.4s" }} />
              )}
            </div>
          );
        })}
      </div>

      {cancelled && (
        <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 20, padding: "6px 16px" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
          <span style={{ color: "#dc2626", fontSize: 13, fontWeight: 700 }}>Pedido cancelado</span>
        </div>
      )}
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9", padding: "48px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ height: 32, borderRadius: 8, background: "#e5e7eb", width: 200, marginBottom: 12, animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: 14, borderRadius: 6, background: "#e5e7eb", width: 150, marginBottom: 36, animation: "pulse 1.5s ease-in-out 0.1s infinite" }} />
        <div style={{ background: "#fff", borderRadius: 18, padding: 24, marginBottom: 16, border: "1px solid #ececec", animation: "pulse 1.5s ease-in-out 0.15s infinite" }}>
          <div style={{ height: 60, background: "#f3f4f6", borderRadius: 12 }} />
        </div>
        {[1, 2].map(i => (
          <div key={i} style={{ background: "#fff", borderRadius: 18, padding: 22, marginBottom: 12, border: "1px solid #ececec", display: "flex", gap: 16, animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite` }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#f3f4f6", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 14, borderRadius: 6, background: "#f3f4f6", width: "55%", marginBottom: 8 }} />
              <div style={{ height: 11, borderRadius: 6, background: "#f3f4f6", width: "80%" }} />
            </div>
          </div>
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function PedidoDetalle() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [items,             setItems]             = useState([]);
  const [estado,            setEstado]            = useState(1);
  const [fecha,             setFecha]             = useState("");
  const [loading,           setLoading]           = useState(true);
  const [guardando,         setGuardando]         = useState(false);
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState(false);
  const [historial,         setHistorial]         = useState([]);
  const [mostrarHistorial,  setMostrarHistorial]  = useState(false);
  const [confirmModal,      setConfirmModal]      = useState(null); // { type: 'cancelar' | 'volver' }

  const { toasts, push, remove: removeToast } = useToasts();

  useEffect(() => { cargarPedido(); }, [id]);

  const cargarPedido = async () => {
    try {
      setLoading(true);
      const data = await getPedido(id);
      if (data.length > 0) {
        setEstado(data[0].id_estado);
        setFecha(data[0].fecha_creacion);
      }
      const agrupados = [];
      data.forEach(d => {
        const existe = agrupados.find(x => x.id_repuesto === d.id_repuesto);
        if (existe) { existe.cantidad += d.cantidad; }
        else { agrupados.push({ id_repuesto: d.id_repuesto, nombre: d.nombre, descripcion: d.descripcion, cantidad: d.cantidad || 1 }); }
      });
      setItems(agrupados);
      const historialData = await getHistorialPedido(id);
      setHistorial(historialData || []);
    } catch (error) {
      console.error(error);
      push("Error al cargar el pedido", "error");
    } finally {
      setLoading(false);
    }
  };

  const cambiarCantidad = (index, valor) => {
    const cantidad = Number(valor);
    if (cantidad < 1) return;
    const copia = [...items];
    copia[index].cantidad = cantidad;
    setItems(copia);
    setCambiosSinGuardar(true);
  };

  const guardar = async () => {
    try {
      setGuardando(true);
      await actualizarPedido(id, { detalles: items });
      push("Pedido actualizado correctamente");
      setCambiosSinGuardar(false);
      setTimeout(() => navigate("/pedidos"), 1200);
    } catch (err) {
      console.error(err);
      push(err.message || "Error al actualizar el pedido", "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = async () => {
    setConfirmModal(null);
    try {
      await cancelarPedido(id);
      push("Pedido cancelado");
      setTimeout(() => navigate("/pedidos"), 1200);
    } catch (err) {
      console.error(err);
      push(err.message || "Error al cancelar el pedido", "error");
    }
  };

  const handleVolver = () => {
    if (cambiosSinGuardar) { setConfirmModal({ type: "volver" }); return; }
    navigate("/pedidos");
  };

  if (loading) return <Skeleton />;

  const cfg          = ESTADO_CFG[estado] || ESTADO_CFG[1];
  const puedeEditar  = estado !== 3 && estado !== 4;
  const totalItems   = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9", fontFamily: "'Segoe UI', sans-serif", padding: "48px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 700, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              Pedido <span style={{ color: "#c40000" }}>#{id}</span>
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "#9ca3af" }}>
              {new Date(fecha).toLocaleString("es-CO", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              {" · "}{totalItems} unidad{totalItems !== 1 ? "es" : ""}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Estado badge */}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot }} />
              {ESTADOS[estado]}
            </span>
            <button
              onClick={handleVolver}
              style={{ background: "#fff", border: "1px solid #e5e7eb", color: "#6b7280", padding: "9px 20px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.color = "#111827"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#6b7280"; }}
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Banner cambios sin guardar */}
        {cambiosSinGuardar && (
          <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 14, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, animation: "toastIn 0.3s ease" }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <p style={{ margin: 0, color: "#92400e", fontSize: 14, fontWeight: 600 }}>Tienes cambios sin guardar</p>
          </div>
        )}

        {/* Estado / Progress */}
        <div style={{ background: "#fff", borderRadius: 18, padding: "24px 28px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #ececec" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>Estado del pedido</h2>
            <button
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              style={{ background: "transparent", border: "1px solid #e5e7eb", color: "#6b7280", padding: "7px 16px", borderRadius: 10, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              🕐 {mostrarHistorial ? "Ocultar historial" : "Ver historial"}
            </button>
          </div>

          <ProgressSteps estado={estado} />

          {/* Timeline historial */}
          {mostrarHistorial && (
            <div style={{ marginTop: 24, borderTop: "1px solid #f3f4f6", paddingTop: 20 }}>
              {historial.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>No hay historial disponible</p>
              ) : (
                <div style={{ position: "relative" }}>
                  {/* Línea vertical */}
                  <div style={{ position: "absolute", left: 15, top: 0, bottom: 0, width: 2, background: "#f3f4f6" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {historial.map((h, i) => {
                      const esCancelado  = h.estado_nuevo === "CANCELADO";
                      const esFinalizado = h.estado_nuevo === "FINALIZADO";
                      const dotColor     = esCancelado ? "#ef4444" : esFinalizado ? "#22c55e" : "#c40000";
                      return (
                        <div key={h.id_historial} style={{ display: "flex", gap: 20, paddingBottom: i < historial.length - 1 ? 20 : 0 }}>
                          {/* Dot */}
                          <div style={{ flexShrink: 0, width: 32, display: "flex", justifyContent: "center" }}>
                            <div style={{ width: 14, height: 14, borderRadius: "50%", background: dotColor, border: `3px solid #fff`, boxShadow: `0 0 0 2px ${dotColor}22`, marginTop: 3, zIndex: 1 }} />
                          </div>
                          {/* Content */}
                          <div style={{ background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: 12, padding: "12px 16px", flex: 1, marginBottom: 0 }}>
                            <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14, color: "#111827" }}>
                              {h.estado_anterior
                                ? <>{h.estado_anterior} <span style={{ color: "#9ca3af", fontWeight: 400 }}>→</span> {h.estado_nuevo}</>
                                : <>Creado en {h.estado_nuevo}</>
                              }
                            </p>
                            <p style={{ margin: "0 0 2px", fontSize: 12, color: "#9ca3af" }}>
                              {new Date(h.fecha_cambio).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                              Por: <span style={{ fontWeight: 600 }}>{h.usuario}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Productos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {items.map((item, i) => (
            <div key={item.id_repuesto} style={{
              background: "#fff", borderRadius: 18, padding: "18px 22px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #ececec",
              display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
              animation: `slideIn 0.3s ease ${i * 0.05}s both`,
            }}>
              <div style={{ width: 54, height: 54, background: "#fff5f5", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, border: "1px solid #fecaca" }}>
                🔧
              </div>

              <div style={{ flex: 1, minWidth: 140 }}>
                <h3 style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700, color: "#111827" }}>{item.nombre}</h3>
                <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{item.descripcion}</p>
              </div>

              {/* Cantidad */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>Cantidad</label>
                {puedeEditar ? (
                  <div style={{ display: "flex", alignItems: "center", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                    <button
                      onClick={() => cambiarCantidad(i, item.cantidad - 1)}
                      style={{ width: 36, height: 36, background: "transparent", border: "none", color: "#6b7280", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >−</button>
                    <input
                      type="number" value={item.cantidad} min={1}
                      onChange={e => cambiarCantidad(i, e.target.value)}
                      style={{ width: 48, border: "none", background: "transparent", textAlign: "center", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#111827", outline: "none", padding: "0 4px" }}
                    />
                    <button
                      onClick={() => cambiarCantidad(i, item.cantidad + 1)}
                      style={{ width: 36, height: 36, background: "transparent", border: "none", color: "#6b7280", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >+</button>
                  </div>
                ) : (
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#111827", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "7px 18px" }}>
                    {item.cantidad}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Acciones */}
        {puedeEditar && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={guardar}
              disabled={guardando}
              style={{
                flex: 1, minWidth: 160, padding: "13px 20px", borderRadius: 12, border: "none",
                background: guardando ? "#e5e7eb" : "linear-gradient(135deg,#16a34a,#22c55e)",
                color: guardando ? "#9ca3af" : "#fff",
                fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: guardando ? "not-allowed" : "pointer",
                boxShadow: guardando ? "none" : "0 6px 20px rgba(22,163,74,0.25)",
                transition: "all 0.2s",
              }}
            >
              {guardando ? "Guardando..." : "✓ Guardar cambios"}
            </button>
            <button
              onClick={() => setConfirmModal({ type: "cancelar" })}
              style={{
                flex: 1, minWidth: 160, padding: "13px 20px", borderRadius: 12,
                border: "1px solid #fecaca", background: "#fff5f5", color: "#c40000",
                fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff5f5"}
            >
              Cancelar pedido
            </button>
          </div>
        )}

      </div>

      {/* Modales */}
      <ConfirmModal
        open={confirmModal?.type === "cancelar"}
        title="¿Cancelar este pedido?"
        message="Esta acción no se puede deshacer. El pedido pasará al estado CANCELADO."
        confirmLabel="Sí, cancelar"
        confirmColor="#c40000"
        onConfirm={handleCancelar}
        onCancel={() => setConfirmModal(null)}
      />
      <ConfirmModal
        open={confirmModal?.type === "volver"}
        title="Tienes cambios sin guardar"
        message="Si sales ahora perderás los cambios que hiciste en las cantidades. ¿Deseas salir igualmente?"
        confirmLabel="Salir sin guardar"
        confirmColor="#6b7280"
        onConfirm={() => navigate("/pedidos")}
        onCancel={() => setConfirmModal(null)}
      />

      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}} @keyframes toastIn{from{opacity:0;transform:translateY(14px) scale(0.95)}to{opacity:1;transform:none}}`}</style>
      <Toast toasts={toasts} onClose={removeToast} />
    </div>
  );
}