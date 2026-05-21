// pages/operador/OperadorPedidos.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPedidos, getEstados, cambiarEstado, cancelarPedido, getHistorialPedido,
} from "../../services/api";
import EstadoBadge from "../../components/EstadoBadge";
import Timeline    from "../../components/Timeline";

const PRIORIDAD_COLOR = { ALTA: "#ef4444", MEDIA: "#f59e0b", BAJA: "#10b981" };

export default function OperadorPedidos() {
  const navigate = useNavigate();

  // ── datos ──────────────────────────────────────────────────────
  const [pedidos,   setPedidos]   = useState([]);
  const [estados,   setEstados]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  // ── filtros ────────────────────────────────────────────────────
  const [filtroEstado,  setFiltroEstado]  = useState("");
  const [filtroDesde,   setFiltroDesde]   = useState("");
  const [filtroHasta,   setFiltroHasta]   = useState("");
  const [busqueda,      setBusqueda]      = useState("");

  // ── modal historial ────────────────────────────────────────────
  const [historialModal, setHistorialModal] = useState(null); // { id, rows }
  const [histLoading,    setHistLoading]    = useState(false);

  // ── modal cambio de estado ─────────────────────────────────────
  const [estadoModal, setEstadoModal]   = useState(null);  // { pedido }
  const [nuevoEstado, setNuevoEstado]   = useState("");
  const [saving,      setSaving]        = useState(false);
  const [msg,         setMsg]           = useState("");

  // ── cargar ─────────────────────────────────────────────────────
  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const filtros = {};
      if (filtroEstado) filtros.estado      = filtroEstado;
      if (filtroDesde)  filtros.fecha_desde = filtroDesde;
      if (filtroHasta)  filtros.fecha_hasta = filtroHasta;
      const data = await getPedidos(filtros);
      setPedidos(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, filtroDesde, filtroHasta]);

  useEffect(() => { cargar(); },   [cargar]);
  useEffect(() => { getEstados().then(setEstados); }, []);

  // ── filtro local por cliente ───────────────────────────────────
  const pedidosFiltrados = pedidos.filter(p =>
    busqueda === "" ||
    (p.cliente_nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.id_pedido).includes(busqueda)
  );

  // ── ver historial ──────────────────────────────────────────────
  const verHistorial = async (id) => {
    setHistLoading(true);
    setHistorialModal({ id, rows: [] });
    try {
      const rows = await getHistorialPedido(id);
      setHistorialModal({ id, rows });
    } finally {
      setHistLoading(false);
    }
  };

  // ── cambiar estado ─────────────────────────────────────────────
  const abrirModalEstado = (pedido) => {
    setEstadoModal(pedido);
    setNuevoEstado(String(pedido.id_estado));
    setMsg("");
  };

  const confirmarCambioEstado = async () => {
    if (!nuevoEstado || nuevoEstado === String(estadoModal.id_estado)) return;
    setSaving(true);
    try {
      await cambiarEstado(estadoModal.id_pedido, Number(nuevoEstado));
      setMsg("✅ Estado actualizado");
      setTimeout(() => { setEstadoModal(null); cargar(); }, 800);
    } catch (e) {
      setMsg("❌ " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── cancelar ──────────────────────────────────────────────────
  const handleCancelar = async (p) => {
    if (!window.confirm(`¿Cancelar el pedido #${p.id_pedido}?`)) return;
    try {
      await cancelarPedido(p.id_pedido);
      cargar();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Pedidos</h1>
          <p style={s.sub}>Gestiona y filtra todos tus pedidos</p>
        </div>
        <button style={s.btnPrimary} onClick={() => navigate("/operador/pedidos/nuevo")}>
          + Nuevo pedido
        </button>
      </div>

      {/* Filtros */}
      <div style={s.filtros}>
        <input
          type="text"
          placeholder="Buscar cliente o #pedido…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={s.input}
        />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={s.select}>
          <option value="">Todos los estados</option>
          {estados.map(e => (
            <option key={e.id_estado} value={e.id_estado}>{e.nombre_estado}</option>
          ))}
        </select>
        <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} style={s.input} />
        <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} style={s.input} />
        <button style={s.btnFiltro} onClick={cargar}>Buscar</button>
        <button style={s.btnSecondary} onClick={() => {
          setFiltroEstado(""); setFiltroDesde(""); setFiltroHasta(""); setBusqueda("");
        }}>Limpiar</button>
      </div>

      {error && <p style={s.error}>{error}</p>}

      {/* Tabla */}
      {loading ? (
        <p style={s.loading}>Cargando pedidos…</p>
      ) : pedidosFiltrados.length === 0 ? (
        <div style={s.empty}>No hay pedidos con esos filtros.</div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {["#", "Cliente", "Estado", "Prioridad", "Fecha", "Acciones"].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(p => (
                <tr key={p.id_pedido} style={s.tr}>
                  <td style={s.td}>
                    <span style={s.idBadge}>#{p.id_pedido}</span>
                  </td>
                  <td style={s.td}>{p.cliente_nombre || "—"}</td>
                  <td style={s.td}><EstadoBadge estado={p.nombre_estado} /></td>
                  <td style={s.td}>
                    {p.prioridad
                      ? <span style={{ ...s.prioBadge, color: PRIORIDAD_COLOR[p.prioridad] || "#64748b" }}>
                          {p.prioridad}
                        </span>
                      : <span style={{ color: "#cbd5e1" }}>—</span>}
                  </td>
                  <td style={s.td}>{new Date(p.fecha_creacion).toLocaleDateString("es-CO")}</td>
                  <td style={{ ...s.td, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button style={s.btnAct} onClick={() => navigate(`/pedido/${p.id_pedido}`)}>Ver</button>
                    {p.id_estado !== 3 && p.id_estado !== 4 && (
                      <>
                        <button style={{ ...s.btnAct, background: "#dbeafe", color: "#1e40af" }}
                          onClick={() => abrirModalEstado(p)}>Estado</button>
                        <button style={{ ...s.btnAct, background: "#fee2e2", color: "#991b1b" }}
                          onClick={() => handleCancelar(p)}>Cancelar</button>
                      </>
                    )}
                    <button style={{ ...s.btnAct, background: "#f1f5f9", color: "#475569" }}
                      onClick={() => verHistorial(p.id_pedido)}>Historial</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal historial ─────────────────────────────────────── */}
      {historialModal && (
        <div style={s.overlay} onClick={() => setHistorialModal(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0 }}>Historial — Pedido #{historialModal.id}</h3>
              <button style={s.closeBtn} onClick={() => setHistorialModal(null)}>✕</button>
            </div>
            <div style={{ padding: "16px 24px 24px" }}>
              {histLoading
                ? <p>Cargando…</p>
                : <Timeline historial={historialModal.rows} />}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal cambio de estado ──────────────────────────────── */}
      {estadoModal && (
        <div style={s.overlay} onClick={() => setEstadoModal(null)}>
          <div style={{ ...s.modal, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0 }}>Cambiar estado — Pedido #{estadoModal.id_pedido}</h3>
              <button style={s.closeBtn} onClick={() => setEstadoModal(null)}>✕</button>
            </div>
            <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <p style={{ margin: "0 0 6px", color: "#64748b", fontSize: 14 }}>Estado actual</p>
                <EstadoBadge estado={estadoModal.nombre_estado} />
              </div>
              <div>
                <label style={{ fontSize: 14, fontWeight: 600 }}>Nuevo estado</label>
                <select
                  value={nuevoEstado}
                  onChange={e => setNuevoEstado(e.target.value)}
                  style={{ ...s.select, marginTop: 6, width: "100%" }}
                >
                  {estados.map(e => (
                    <option key={e.id_estado} value={e.id_estado}>{e.nombre_estado}</option>
                  ))}
                </select>
              </div>
              {msg && <p style={{ margin: 0, fontWeight: 600 }}>{msg}</p>}
              <div style={{ display: "flex", gap: 10 }}>
                <button style={s.btnPrimary} disabled={saving} onClick={confirmarCambioEstado}>
                  {saving ? "Guardando…" : "Confirmar"}
                </button>
                <button style={s.btnSecondary} onClick={() => setEstadoModal(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:        { padding: "30px 36px", maxWidth: 1200, margin: "auto" },
  header:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 },
  title:       { margin: 0, fontSize: "1.8rem", color: "#0ea5e9", fontWeight: 800 },
  sub:         { margin: "4px 0 0", color: "#64748b", fontSize: 14 },
  btnPrimary:  { background: "#0ea5e9", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  btnSecondary:{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "10px 18px", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 14 },
  btnFiltro:   { background: "#0ea5e9", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 14 },
  filtros:     { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22, alignItems: "center" },
  input:       { padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, minWidth: 140 },
  select:      { padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14 },
  error:       { color: "#ef4444", background: "#fef2f2", padding: "10px 16px", borderRadius: 8, marginBottom: 16 },
  loading:     { color: "#94a3b8", padding: 20, textAlign: "center" },
  empty:       { textAlign: "center", padding: 40, color: "#94a3b8", background: "#f8fafc", borderRadius: 12 },
  tableWrap:   { overflowX: "auto", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  table:       { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden" },
  th:          { textAlign: "left", padding: "12px 16px", background: "#f8fafc", color: "#64748b", fontSize: 13, fontWeight: 700, borderBottom: "1px solid #e2e8f0" },
  tr:          { borderBottom: "1px solid #f1f5f9" },
  td:          { padding: "12px 16px", fontSize: 14, color: "#334155", verticalAlign: "middle" },
  idBadge:     { fontWeight: 700, color: "#0ea5e9" },
  prioBadge:   { fontWeight: 700, fontSize: 12 },
  btnAct:      { fontSize: 12, padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, background: "#e0f2fe", color: "#0369a1" },
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" },
  modal:       { background: "#fff", borderRadius: 16, width: "90%", maxWidth: 620, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #e2e8f0" },
  closeBtn:    { background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" },
};