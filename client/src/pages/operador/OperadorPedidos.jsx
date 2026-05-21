// pages/operador/OperadorPedidos.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EstadoBadge from "../../components/EstadoBadge";
import Timeline from "../../components/Timeline";
import {
  getPedidos,
  cambiarEstado,
  cancelarPedido,
  getHistorialPedido,
  getEstados,
} from "../../services/api";

export default function OperadorPedidos() {
  const navigate = useNavigate();
  const [pedidos, setPedidos]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Filtros
  const [filtroEstado, setFiltroEstado]     = useState("");
  const [filtroFechaD, setFiltroFechaD]     = useState("");
  const [filtroFechaH, setFiltroFechaH]     = useState("");
  const [busqueda, setBusqueda]             = useState("");

  // Modal historial
  const [historialModal, setHistorialModal] = useState(null);
  const [historial, setHistorial]           = useState([]);
  const [loadingH, setLoadingH]             = useState(false);

  // Modal cambiar estado
  const [estadoModal, setEstadoModal]       = useState(null);
  const [nuevoEstado, setNuevoEstado]       = useState("");
  const [estados, setEstados]               = useState([]);
  const [guardandoE, setGuardandoE]         = useState(false);

  useEffect(() => {
    cargar();
    getEstados().then(setEstados).catch(() => {});
  }, []);

  const cargar = async (filtros = {}) => {
    try {
      setLoading(true);
      setError("");
      const data = await getPedidos(filtros);
      setPedidos(data || []);
    } catch (e) {
      setError(e.message || "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    const f = {};
    if (filtroEstado) f.estado = filtroEstado;
    if (filtroFechaD) f.fecha_desde = filtroFechaD;
    if (filtroFechaH) f.fecha_hasta = filtroFechaH;
    cargar(f);
  };

  const limpiarFiltros = () => {
    setFiltroEstado("");
    setFiltroFechaD("");
    setFiltroFechaH("");
    setBusqueda("");
    cargar();
  };

  const abrirHistorial = async (pedido) => {
    setHistorialModal(pedido);
    setHistorial([]);
    setLoadingH(true);
    try {
      const data = await getHistorialPedido(pedido.id_pedido);
      setHistorial(data || []);
    } catch { setHistorial([]); }
    finally { setLoadingH(false); }
  };

  const abrirCambioEstado = (pedido) => {
    setEstadoModal(pedido);
    setNuevoEstado(String(pedido.id_estado));
  };

  const confirmarCambioEstado = async () => {
    if (!nuevoEstado || !estadoModal) return;
    try {
      setGuardandoE(true);
      await cambiarEstado(estadoModal.id_pedido, parseInt(nuevoEstado));
      setEstadoModal(null);
      cargar();
    } catch (e) {
      alert(e.message || "Error al cambiar estado");
    } finally {
      setGuardandoE(false);
    }
  };

  const handleCancelar = async (pedido) => {
    if (!window.confirm(`¿Cancelar pedido #${pedido.id_pedido}?`)) return;
    try {
      await cancelarPedido(pedido.id_pedido);
      cargar();
    } catch (e) {
      alert(e.message || "Error al cancelar");
    }
  };

  const pedidosFiltrados = pedidos.filter(p => {
    if (!busqueda) return true;
    const b = busqueda.toLowerCase();
    return (
      String(p.id_pedido).includes(b) ||
      (p.cliente_nombre || "").toLowerCase().includes(b)
    );
  });

  const estadoLabel = { 1: "PENDIENTE", 2: "EN PROCESO", 3: "FINALIZADO", 4: "CANCELADO" };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>📋 Mis Pedidos</h1>
          <p style={s.sub}>{pedidosFiltrados.length} pedido(s) encontrado(s)</p>
        </div>
        <button style={s.btnPrimary} onClick={() => navigate("/operador/pedidos/nuevo")}>
          + Nuevo pedido
        </button>
      </div>

      {/* Filtros */}
      <div style={s.filtrosBox}>
        <input
          placeholder="Buscar por #ID o cliente..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={s.input}
        />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={s.select}>
          <option value="">Todos los estados</option>
          <option value="1">PENDIENTE</option>
          <option value="2">EN PROCESO</option>
          <option value="3">FINALIZADO</option>
          <option value="4">CANCELADO</option>
        </select>
        <input type="date" value={filtroFechaD} onChange={e => setFiltroFechaD(e.target.value)} style={s.input} />
        <input type="date" value={filtroFechaH} onChange={e => setFiltroFechaH(e.target.value)} style={s.input} />
        <button style={s.btnFilter} onClick={aplicarFiltros}>Filtrar</button>
        <button style={s.btnClear} onClick={limpiarFiltros}>Limpiar</button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}
      {loading && <div style={s.loadingBox}>Cargando pedidos...</div>}

      {/* Tabla */}
      {!loading && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {["#", "Cliente", "Estado", "Fecha", "Prioridad", "Acciones"].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length === 0 ? (
                <tr><td colSpan={6} style={{ ...s.td, textAlign: "center", color: "#94a3b8" }}>Sin pedidos</td></tr>
              ) : pedidosFiltrados.map(p => (
                <tr key={p.id_pedido} style={s.tr}>
                  <td style={s.td}><strong>#{p.id_pedido}</strong></td>
                  <td style={s.td}>{p.cliente_nombre || "—"}</td>
                  <td style={s.td}><EstadoBadge estado={p.nombre_estado || estadoLabel[p.id_estado]} /></td>
                  <td style={s.td}>{new Date(p.fecha_creacion).toLocaleDateString("es-CO")}</td>
                  <td style={s.td}>{p.prioridad || <span style={{ color: "#ccc" }}>—</span>}</td>
                  <td style={{ ...s.td, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button style={s.btnAct} onClick={() => navigate(`/pedido/${p.id_pedido}`)}>
                      Ver
                    </button>
                    {p.id_estado !== 3 && p.id_estado !== 4 && (
                      <>
                        <button style={{ ...s.btnAct, background: "#3b82f6" }} onClick={() => abrirCambioEstado(p)}>
                          Estado
                        </button>
                        <button style={{ ...s.btnAct, background: "#ef4444" }} onClick={() => handleCancelar(p)}>
                          Cancelar
                        </button>
                      </>
                    )}
                    <button style={{ ...s.btnAct, background: "#64748b" }} onClick={() => abrirHistorial(p)}>
                      Historial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Historial */}
      {historialModal && (
        <div style={s.overlay} onClick={() => setHistorialModal(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0, color: "#0ea5e9" }}>Historial — Pedido #{historialModal.id_pedido}</h3>
              <button style={s.closeBtn} onClick={() => setHistorialModal(null)}>✕</button>
            </div>
            {loadingH ? <p style={{ color: "#94a3b8" }}>Cargando...</p> : <Timeline historial={historial} />}
          </div>
        </div>
      )}

      {/* Modal Cambiar Estado */}
      {estadoModal && (
        <div style={s.overlay} onClick={() => setEstadoModal(null)}>
          <div style={{ ...s.modal, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0, color: "#0ea5e9" }}>Cambiar estado — #{estadoModal.id_pedido}</h3>
              <button style={s.closeBtn} onClick={() => setEstadoModal(null)}>✕</button>
            </div>
            <p style={{ color: "#64748b", marginBottom: 14 }}>
              Estado actual: <EstadoBadge estado={estadoModal.nombre_estado || estadoLabel[estadoModal.id_estado]} />
            </p>
            <select
              value={nuevoEstado}
              onChange={e => setNuevoEstado(e.target.value)}
              style={{ ...s.select, width: "100%", marginBottom: 16 }}
            >
              {estados.map(e => (
                <option key={e.id_estado} value={e.id_estado}>{e.nombre_estado}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...s.btnPrimary, flex: 1 }} onClick={confirmarCambioEstado} disabled={guardandoE}>
                {guardandoE ? "Guardando..." : "Confirmar"}
              </button>
              <button style={{ ...s.btnClear, flex: 1 }} onClick={() => setEstadoModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:       { padding: "30px 36px", maxWidth: 1200, margin: "auto" },
  header:     { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 },
  title:      { margin: 0, fontSize: "1.8rem", color: "#0ea5e9", fontWeight: 800 },
  sub:        { margin: "4px 0 0", color: "#64748b", fontSize: 14 },
  btnPrimary: { background: "#0ea5e9", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  filtrosBox: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, padding: "16px 20px", background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" },
  input:      { padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "#f8fafc", color: "#1e293b" },
  select:     { padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, background: "#f8fafc", color: "#1e293b" },
  btnFilter:  { background: "#0ea5e9", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" },
  btnClear:   { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", padding: "8px 18px", borderRadius: 8, fontWeight: 600, cursor: "pointer" },
  errorBox:   { background: "#fef2f2", color: "#ef4444", padding: "12px 18px", borderRadius: 10, marginBottom: 16 },
  loadingBox: { textAlign: "center", color: "#64748b", padding: 40 },
  tableWrap:  { background: "#fff", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0", overflow: "hidden" },
  table:      { width: "100%", borderCollapse: "collapse" },
  th:         { textAlign: "left", padding: "13px 16px", background: "#f8fafc", color: "#64748b", fontSize: 13, fontWeight: 700, borderBottom: "1px solid #e2e8f0" },
  tr:         { borderBottom: "1px solid #f1f5f9" },
  td:         { padding: "12px 16px", fontSize: 14, color: "#334155", verticalAlign: "middle" },
  btnAct:     { background: "#0ea5e9", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 },
  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal:      { background: "#fff", borderRadius: 16, padding: 28, width: "90%", maxWidth: 560, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalHeader:{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  closeBtn:   { background: "#f1f5f9", border: "none", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16, color: "#64748b" },
};