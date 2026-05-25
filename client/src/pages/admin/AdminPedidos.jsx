// client/src/pages/admin/AdminPedidos.jsx
// RF8 FIX: buildParams() usa estado (no id_estado), fecha_desde, fecha_hasta
// RF8 FIX: agrega búsqueda por nombre de cliente y por ID de pedido (campo busqueda)
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPedidos,
  cancelarPedido,
  cambiarEstado,
  getHistorialPedido,
  getEstados,
  editarPedido,
} from "../../services/api";
import EstadoBadge from "../../components/EstadoBadge";
import Timeline    from "../../components/Timeline";

const ACENTO = "#7c3aed";
const estadoLabel = { 1: "PENDIENTE", 2: "EN PROCESO", 3: "FINALIZADO", 4: "CANCELADO" };

export default function AdminPedidos() {
  const navigate = useNavigate();

  const [pedidos,      setPedidos]      = useState([]);
  const [estados,      setEstados]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");

  // Filtros
  const [busqueda,     setBusqueda]     = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFechaD, setFiltroFechaD] = useState("");
  const [filtroFechaH, setFiltroFechaH] = useState("");
  const [filtroPrior,  setFiltroPrior]  = useState("");

  // Modales
  const [historialModal, setHistorialModal] = useState(null);
  const [historial,      setHistorial]      = useState([]);
  const [loadingH,       setLoadingH]       = useState(false);
  const [estadoModal,    setEstadoModal]    = useState(null);
  const [nuevoEstado,    setNuevoEstado]    = useState("");
  const [guardandoE,     setGuardandoE]     = useState(false);
  const [editModal,      setEditModal]      = useState(null);
  const [editForm,       setEditForm]       = useState({ prioridad: "", observaciones: "", fecha_entrega_estimada: "" });
  const [guardandoEdit,  setGuardandoEdit]  = useState(false);

  useEffect(() => {
    cargar();
    getEstados().then(setEstados).catch(() => {});
  }, []);

  // RF8 FIX: params con nombres correctos que acepta el backend
  const buildParams = useCallback(() => {
    const p = {};
    // RF8 FIX: estado (no id_estado)
    if (filtroEstado) p.estado      = filtroEstado;
    // RF8 FIX: fecha_desde (no desde)
    if (filtroFechaD) p.fecha_desde = filtroFechaD;
    // RF8 FIX: fecha_hasta (no hasta)
    if (filtroFechaH) p.fecha_hasta = filtroFechaH;
    if (filtroPrior)  p.prioridad   = filtroPrior;
    // RF8 FIX: búsqueda por nombre de cliente o ID de pedido
    if (busqueda)     p.busqueda    = busqueda;
    return p;
  }, [filtroEstado, filtroFechaD, filtroFechaH, filtroPrior, busqueda]);

  const cargar = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getPedidos(buildParams());
      setPedidos(data || []);
    } catch (e) {
      setError(e.message || "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => cargar();
  const limpiarFiltros = () => {
    setFiltroEstado(""); setFiltroFechaD(""); setFiltroFechaH(""); setFiltroPrior(""); setBusqueda("");
    setTimeout(cargar, 0);
  };

  const abrirHistorial = async (p) => {
    setHistorialModal(p);
    setHistorial([]);
    setLoadingH(true);
    try {
      const data = await getHistorialPedido(p.id_pedido);
      setHistorial(data || []);
    } catch { setHistorial([]); }
    finally { setLoadingH(false); }
  };

  const abrirCambioEstado = (p) => {
    setEstadoModal(p);
    setNuevoEstado(String(p.id_estado));
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

  const handleCancelar = async (p) => {
    if (!window.confirm(`¿Cancelar pedido #${p.id_pedido}? Se restaurará el stock.`)) return;
    try {
      await cancelarPedido(p.id_pedido);
      cargar();
    } catch (e) {
      alert(e.message || "Error al cancelar");
    }
  };

  const abrirEditar = (p) => {
    setEditModal(p);
    setEditForm({
      prioridad: p.prioridad || "",
      observaciones: p.observaciones || "",
      fecha_entrega_estimada: p.fecha_entrega_estimada ? p.fecha_entrega_estimada.slice(0, 16) : "",
    });
  };

  const guardarEdicion = async () => {
    if (!editModal) return;
    try {
      setGuardandoEdit(true);
      await editarPedido(editModal.id_pedido, {
        prioridad: editForm.prioridad || null,
        observaciones: editForm.observaciones || null,
        fecha_entrega_estimada: editForm.fecha_entrega_estimada || null,
      });
      setEditModal(null);
      cargar();
    } catch (e) {
      alert(e.message || "Error al guardar");
    } finally {
      setGuardandoEdit(false);
    }
  };

  // Filtro local adicional por búsqueda de texto (complementa el server-side)
  const pedidosFiltrados = pedidos.filter(p => {
    if (!busqueda) return true;
    const b = busqueda.toLowerCase();
    return (
      String(p.id_pedido).includes(b) ||
      (p.cliente_nombre || "").toLowerCase().includes(b) ||
      (p.nombre_estado  || "").toLowerCase().includes(b)
    );
  });

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Todos los pedidos</h1>
          <p style={s.sub}>{pedidosFiltrados.length} pedido(s) · Vista administrador</p>
        </div>
        <button style={s.btnBack} onClick={() => navigate("/admin")}>← Dashboard</button>
      </div>

      {/* Filtros — RF8 FIX */}
      <div style={s.filtrosBox}>
        <input
          placeholder="Buscar #ID o nombre de cliente..."
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
        <select value={filtroPrior} onChange={e => setFiltroPrior(e.target.value)} style={s.select}>
          <option value="">Todas las prioridades</option>
          <option value="ALTA">ALTA</option>
          <option value="MEDIA">MEDIA</option>
          <option value="BAJA">BAJA</option>
        </select>
        <input type="date" value={filtroFechaD} onChange={e => setFiltroFechaD(e.target.value)} style={s.input} />
        <input type="date" value={filtroFechaH} onChange={e => setFiltroFechaH(e.target.value)} style={s.input} />
        <button style={s.btnPrimary} onClick={aplicarFiltros}>Filtrar</button>
        <button style={s.btnClear}   onClick={limpiarFiltros}>Limpiar</button>
      </div>

      {error   && <div style={s.errorBox}>{error}</div>}
      {loading && <div style={s.loadingBox}>Cargando pedidos...</div>}

      {!loading && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {["#", "Cliente", "Estado", "Prioridad", "Fecha", "Entrega estimada", "Acciones"].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...s.td, textAlign: "center", color: "#94a3b8", padding: 40 }}>
                    Sin pedidos
                  </td>
                </tr>
              ) : pedidosFiltrados.map(p => (
                <tr key={p.id_pedido} style={s.tr}>
                  <td style={s.td}><strong style={{ color: ACENTO }}>#{p.id_pedido}</strong></td>
                  <td style={s.td}>{p.cliente_nombre || "—"}</td>
                  <td style={s.td}><EstadoBadge estado={p.nombre_estado || estadoLabel[p.id_estado]} /></td>
                  <td style={s.td}>
                    {p.prioridad ? (
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        background: p.prioridad === "ALTA" ? "#fee2e2" : p.prioridad === "MEDIA" ? "#fef3c7" : "#f0fdf4",
                        color:      p.prioridad === "ALTA" ? "#991b1b" : p.prioridad === "MEDIA" ? "#92400e" : "#065f46",
                      }}>
                        {p.prioridad}
                      </span>
                    ) : <span style={{ color: "#cbd5e1" }}>—</span>}
                  </td>
                  <td style={s.td}>{new Date(p.fecha_creacion).toLocaleDateString("es-CO")}</td>
                  <td style={s.td}>
                    {p.fecha_entrega_estimada
                      ? new Date(p.fecha_entrega_estimada).toLocaleDateString("es-CO")
                      : <span style={{ color: "#cbd5e1" }}>—</span>}
                  </td>
                  <td style={{ ...s.td, display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <button style={s.btnAct}                          onClick={() => navigate(`/pedido/${p.id_pedido}`)}>Ver</button>
                    <button style={{ ...s.btnAct, background: ACENTO }} onClick={() => abrirEditar(p)}>Editar</button>
                    {p.id_estado !== 3 && p.id_estado !== 4 && (
                      <>
                        <button style={{ ...s.btnAct, background: "#3b82f6" }} onClick={() => abrirCambioEstado(p)}>Estado</button>
                        <button style={{ ...s.btnAct, background: "#ef4444" }} onClick={() => handleCancelar(p)}>Cancelar</button>
                      </>
                    )}
                    <button style={{ ...s.btnAct, background: "#64748b" }} onClick={() => abrirHistorial(p)}>Historial</button>
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
              <h3 style={{ margin: 0, color: ACENTO }}>Historial — Pedido #{historialModal.id_pedido}</h3>
              <button style={s.closeBtn} onClick={() => setHistorialModal(null)}>✕</button>
            </div>
            {loadingH ? <p style={{ color: "#94a3b8" }}>Cargando...</p> : <Timeline historial={historial} />}
          </div>
        </div>
      )}

      {/* Modal Cambiar Estado */}
      {estadoModal && (
        <div style={s.overlay} onClick={() => setEstadoModal(null)}>
          <div style={{ ...s.modal, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0, color: ACENTO }}>Cambiar estado — #{estadoModal.id_pedido}</h3>
              <button style={s.closeBtn} onClick={() => setEstadoModal(null)}>✕</button>
            </div>
            <p style={{ color: "#64748b", marginBottom: 14, fontSize: 14 }}>
              Estado actual: <EstadoBadge estado={estadoModal.nombre_estado || estadoLabel[estadoModal.id_estado]} />
            </p>
            <select
              value={nuevoEstado}
              onChange={e => setNuevoEstado(e.target.value)}
              style={{ ...s.select, width: "100%", marginBottom: 18 }}
            >
              {estados.map(e => (
                <option key={e.id_estado} value={e.id_estado}>{e.nombre_estado}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...s.btnPrimary, flex: 1 }} onClick={confirmarCambioEstado} disabled={guardandoE}>
                {guardandoE ? "Guardando..." : "Confirmar"}
              </button>
              <button style={{ ...s.btnClear, flex: 1 }} onClick={() => setEstadoModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editModal && (
        <div style={s.overlay} onClick={() => setEditModal(null)}>
          <div style={{ ...s.modal, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0, color: ACENTO }}>Editar pedido #{editModal.id_pedido}</h3>
              <button style={s.closeBtn} onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={s.label}>Prioridad</label>
                <select value={editForm.prioridad} onChange={e => setEditForm(f => ({ ...f, prioridad: e.target.value }))} style={{ ...s.select, width: "100%" }}>
                  <option value="">Sin prioridad</option>
                  <option value="ALTA">ALTA</option>
                  <option value="MEDIA">MEDIA</option>
                  <option value="BAJA">BAJA</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Fecha entrega estimada</label>
                <input type="datetime-local" value={editForm.fecha_entrega_estimada} onChange={e => setEditForm(f => ({ ...f, fecha_entrega_estimada: e.target.value }))} style={{ ...s.input, width: "100%" }} />
              </div>
              <div>
                <label style={s.label}>Observaciones</label>
                <textarea value={editForm.observaciones} onChange={e => setEditForm(f => ({ ...f, observaciones: e.target.value }))} rows={3} style={{ ...s.input, width: "100%", resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ ...s.btnPrimary, flex: 1 }} onClick={guardarEdicion} disabled={guardandoEdit}>
                  {guardandoEdit ? "Guardando..." : "Guardar cambios"}
                </button>
                <button style={{ ...s.btnClear, flex: 1 }} onClick={() => setEditModal(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:        { padding: "30px 36px", maxWidth: 1400, margin: "auto" },
  header:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 },
  title:       { margin: 0, fontSize: "1.9rem", color: "#7c3aed", fontWeight: 900 },
  sub:         { margin: "4px 0 0", color: "#64748b", fontSize: 14 },
  btnBack:     { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", padding: "9px 18px", borderRadius: 9, fontWeight: 600, cursor: "pointer", fontSize: 14 },
  btnPrimary:  { background: "#7c3aed", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 9, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  filtrosBox:  { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, padding: "16px 20px", background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" },
  input:       { padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "#f8fafc", color: "#1e293b" },
  select:      { padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, background: "#f8fafc", color: "#1e293b" },
  btnClear:    { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", padding: "8px 18px", borderRadius: 8, fontWeight: 600, cursor: "pointer" },
  errorBox:    { background: "#fef2f2", color: "#ef4444", padding: "12px 18px", borderRadius: 10, marginBottom: 16 },
  loadingBox:  { textAlign: "center", color: "#64748b", padding: 40 },
  tableWrap:   { background: "#fff", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0", overflow: "auto" },
  table:       { width: "100%", borderCollapse: "collapse", minWidth: 900 },
  th:          { textAlign: "left", padding: "13px 16px", background: "#f8fafc", color: "#64748b", fontSize: 12, fontWeight: 700, borderBottom: "1px solid #e2e8f0", textTransform: "uppercase", letterSpacing: 0.5 },
  tr:          { borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" },
  td:          { padding: "11px 16px", fontSize: 14, color: "#334155", verticalAlign: "middle" },
  btnAct:      { background: "#0ea5e9", color: "#fff", border: "none", padding: "5px 12px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600 },
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal:       { background: "#fff", borderRadius: 16, padding: 28, width: "90%", maxWidth: 560, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  closeBtn:    { background: "#f1f5f9", border: "none", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16, color: "#64748b" },
  label:       { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" },
  toast:       { padding: "12px 18px", borderRadius: 10, marginBottom: 16, fontWeight: 600, fontSize: 14 },
};