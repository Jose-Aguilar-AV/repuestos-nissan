// pages/admin/AdminUsuarios.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUsuarios,
  crearUsuario,
  toggleEstadoUsuario,
  cambiarRolUsuario,
} from "../../services/api";

const ACENTO  = "#7c3aed";
const ROLES   = ["CLIENTE", "OPERADOR", "ADMINISTRADOR"];
const ROL_COLOR = {
  ADMINISTRADOR: { bg: "#f5f3ff", color: "#7c3aed", border: "#c4b5fd" },
  OPERADOR:      { bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd" },
  CLIENTE:       { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
};

function RolBadge({ rol }) {
  const c = ROL_COLOR[rol] || { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" };
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontSize: 12,
    }}>
      {rol}
    </span>
  );
}

export default function AdminUsuarios() {
  const navigate = useNavigate();

  const [usuarios,   setUsuarios]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [msg,        setMsg]        = useState("");
  const [error,      setError]      = useState("");

  // Filtros
  const [busqueda,   setBusqueda]   = useState("");
  const [filtroRol,  setFiltroRol]  = useState("");
  const [filtroEst,  setFiltroEst]  = useState("");

  // Modal crear
  const [showCrear,  setShowCrear]  = useState(false);
  const [formCrear,  setFormCrear]  = useState({ nombre: "", correo: "", contrasena: "", rol: "OPERADOR" });
  const [creando,    setCreando]    = useState(false);
  const [errCrear,   setErrCrear]   = useState("");

  // Modal rol
  const [rolModal,   setRolModal]   = useState(null);
  const [nuevoRol,   setNuevoRol]   = useState("");
  const [guardandoR, setGuardandoR] = useState(false);

  // Modal detalle
  const [detalleModal, setDetalleModal] = useState(null);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUsuarios();
      setUsuarios(data || []);
    } catch (e) {
      setError(e.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const mostrarMsg = (m, esError = false) => {
    setMsg(m);
    if (esError) setError(m); else setError("");
    setTimeout(() => setMsg(""), 3000);
  };

  // ── Crear usuario
  const handleCrear = async () => {
    if (!formCrear.nombre.trim() || !formCrear.correo.trim() || !formCrear.contrasena.trim()) {
      setErrCrear("Todos los campos son obligatorios"); return;
    }
    try {
      setCreando(true);
      setErrCrear("");
      await crearUsuario({
        nombre:    formCrear.nombre.trim(),
        correo:    formCrear.correo.trim().toLowerCase(),
        contrasena: formCrear.contrasena.trim(),
        rol:       formCrear.rol,
      });
      setShowCrear(false);
      setFormCrear({ nombre: "", correo: "", contrasena: "", rol: "OPERADOR" });
      mostrarMsg("✅ Usuario creado exitosamente");
      cargar();
    } catch (e) {
      setErrCrear(e.message || "Error al crear usuario");
    } finally {
      setCreando(false);
    }
  };

  // ── Toggle estado
  const handleToggleEstado = async (u) => {
    const nuevoEstado = u.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    const accion = nuevoEstado === "ACTIVO" ? "activar" : "desactivar";
    if (!window.confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${u.nombre}?`)) return;
    try {
      await toggleEstadoUsuario(u.id, nuevoEstado);
      mostrarMsg(`✅ Usuario ${accion === "activar" ? "activado" : "desactivado"}`);
      cargar();
    } catch (e) {
      mostrarMsg(e.message || `Error al ${accion}`, true);
    }
  };

  // ── Cambiar rol
  const abrirRolModal = (u) => { setRolModal(u); setNuevoRol(u.rol); };

  const confirmarRol = async () => {
    if (!rolModal || nuevoRol === rolModal.rol) { setRolModal(null); return; }
    try {
      setGuardandoR(true);
      await cambiarRolUsuario(rolModal.id, nuevoRol);
      setRolModal(null);
      mostrarMsg("✅ Rol actualizado");
      cargar();
    } catch (e) {
      mostrarMsg(e.message || "Error al cambiar rol", true);
    } finally {
      setGuardandoR(false);
    }
  };

  // ── Filtrado cliente-side
  const usuariosFiltrados = usuarios.filter(u => {
    const b = busqueda.toLowerCase();
    const matchBusqueda = !busqueda || u.nombre.toLowerCase().includes(b) || u.correo.toLowerCase().includes(b) || String(u.id).includes(b);
    const matchRol  = !filtroRol  || u.rol    === filtroRol;
    const matchEst  = !filtroEst  || u.estado === filtroEst;
    return matchBusqueda && matchRol && matchEst;
  });

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>👥 Usuarios</h1>
          <p style={s.sub}>{usuariosFiltrados.length} de {usuarios.length} usuario(s)</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={s.btnPrimary} onClick={() => setShowCrear(true)}>+ Crear usuario</button>
          <button style={s.btnBack}    onClick={() => navigate("/admin")}>← Dashboard</button>
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{
          ...s.toast,
          background: msg.startsWith("✅") ? "#d1fae5" : "#fee2e2",
          color:      msg.startsWith("✅") ? "#065f46" : "#991b1b",
          border:     `1px solid ${msg.startsWith("✅") ? "#6ee7b7" : "#fca5a5"}`,
        }}>
          {msg}
        </div>
      )}

      {/* Filtros */}
      <div style={s.filtrosBox}>
        <input
          placeholder="Buscar por nombre, correo o ID..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ ...s.input, minWidth: 220 }}
        />
        <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)} style={s.select}>
          <option value="">Todos los roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filtroEst} onChange={e => setFiltroEst(e.target.value)} style={s.select}>
          <option value="">Todos los estados</option>
          <option value="ACTIVO">ACTIVO</option>
          <option value="INACTIVO">INACTIVO</option>
        </select>
        <button style={s.btnClear} onClick={() => { setBusqueda(""); setFiltroRol(""); setFiltroEst(""); }}>
          Limpiar
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {ROLES.map(r => {
          const count = usuarios.filter(u => u.rol === r).length;
          const c = ROL_COLOR[r];
          return (
            <div key={r} style={{
              background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10,
              padding: "10px 18px", display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>
                {r === "ADMINISTRADOR" ? "👑" : r === "OPERADOR" ? "⚙️" : "👤"}
              </span>
              <div>
                <div style={{ fontSize: 11, color: c.color, fontWeight: 700, textTransform: "uppercase" }}>{r}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: c.color }}>{count}</div>
              </div>
            </div>
          );
        })}
        <div style={{
          background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10,
          padding: "10px 18px", display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>🔴</span>
          <div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Inactivos</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#64748b" }}>
              {usuarios.filter(u => u.estado === "INACTIVO").length}
            </div>
          </div>
        </div>
      </div>

      {error   && <div style={s.errorBox}>{error}</div>}
      {loading && <div style={s.loadingBox}>Cargando usuarios...</div>}

      {/* Tabla */}
      {!loading && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {["ID", "Nombre", "Correo", "Rol", "Estado", "Creado", "Acciones"].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...s.td, textAlign: "center", color: "#94a3b8", padding: 40 }}>
                    Sin usuarios
                  </td>
                </tr>
              ) : usuariosFiltrados.map(u => (
                <tr key={u.id} style={{
                  ...s.tr,
                  opacity: u.estado === "INACTIVO" ? 0.6 : 1,
                }}>
                  <td style={s.td}><strong style={{ color: ACENTO }}>#{u.id}</strong></td>
                  <td style={s.td}>
                    <button
                      style={{ background: "none", border: "none", fontWeight: 700, color: "#1e293b", cursor: "pointer", fontSize: 14, padding: 0 }}
                      onClick={() => setDetalleModal(u)}
                    >
                      {u.nombre}
                    </button>
                  </td>
                  <td style={{ ...s.td, color: "#64748b" }}>{u.correo}</td>
                  <td style={s.td}><RolBadge rol={u.rol} /></td>
                  <td style={s.td}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: u.estado === "ACTIVO" ? "#d1fae5" : "#fee2e2",
                      color:      u.estado === "ACTIVO" ? "#065f46" : "#991b1b",
                      border:     `1px solid ${u.estado === "ACTIVO" ? "#6ee7b7" : "#fca5a5"}`,
                    }}>
                      {u.estado}
                    </span>
                  </td>
                  <td style={{ ...s.td, color: "#94a3b8", fontSize: 12 }}>
                    {new Date(u.creado_en).toLocaleDateString("es-CO")}
                  </td>
                  <td style={{ ...s.td, display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <button style={s.btnAct} onClick={() => abrirRolModal(u)}>Rol</button>
                    <button
                      style={{ ...s.btnAct, background: u.estado === "ACTIVO" ? "#f97316" : "#10b981" }}
                      onClick={() => handleToggleEstado(u)}
                    >
                      {u.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                    </button>
                    <button style={{ ...s.btnAct, background: "#64748b" }} onClick={() => setDetalleModal(u)}>
                      Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal Crear Usuario ── */}
      {showCrear && (
        <div style={s.overlay} onClick={() => setShowCrear(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0, color: ACENTO }}>Crear usuario</h3>
              <button style={s.closeBtn} onClick={() => setShowCrear(false)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={s.label}>Nombre completo *</label>
                <input
                  value={formCrear.nombre}
                  onChange={e => setFormCrear(f => ({ ...f, nombre: e.target.value }))}
                  style={{ ...s.input, width: "100%" }}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label style={s.label}>Correo electrónico *</label>
                <input
                  type="email"
                  value={formCrear.correo}
                  onChange={e => setFormCrear(f => ({ ...f, correo: e.target.value }))}
                  style={{ ...s.input, width: "100%" }}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div>
                <label style={s.label}>Contraseña *</label>
                <input
                  type="password"
                  value={formCrear.contrasena}
                  onChange={e => setFormCrear(f => ({ ...f, contrasena: e.target.value }))}
                  style={{ ...s.input, width: "100%" }}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label style={s.label}>Rol</label>
                <select
                  value={formCrear.rol}
                  onChange={e => setFormCrear(f => ({ ...f, rol: e.target.value }))}
                  style={{ ...s.select, width: "100%" }}
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {errCrear && (
                <div style={{ background: "#fef2f2", color: "#ef4444", padding: "10px 14px", borderRadius: 8, fontSize: 13, border: "1px solid #fca5a5" }}>
                  {errCrear}
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ ...s.btnPrimary, flex: 1 }} onClick={handleCrear} disabled={creando}>
                  {creando ? "Creando..." : "Crear usuario"}
                </button>
                <button style={{ ...s.btnClear, flex: 1 }} onClick={() => { setShowCrear(false); setErrCrear(""); }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Cambiar Rol ── */}
      {rolModal && (
        <div style={s.overlay} onClick={() => setRolModal(null)}>
          <div style={{ ...s.modal, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0, color: ACENTO }}>Cambiar rol — {rolModal.nombre}</h3>
              <button style={s.closeBtn} onClick={() => setRolModal(null)}>✕</button>
            </div>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 14 }}>
              Rol actual: <RolBadge rol={rolModal.rol} />
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {ROLES.map(r => (
                <div
                  key={r}
                  onClick={() => setNuevoRol(r)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: `2px solid ${nuevoRol === r ? ACENTO : "#e2e8f0"}`,
                    background: nuevoRol === r ? "#f5f3ff" : "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  <span>{r === "ADMINISTRADOR" ? "👑" : r === "OPERADOR" ? "⚙️" : "👤"}</span>
                  {r}
                  {nuevoRol === r && <span style={{ marginLeft: "auto", color: ACENTO }}>✓</span>}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...s.btnPrimary, flex: 1 }} onClick={confirmarRol} disabled={guardandoR}>
                {guardandoR ? "Guardando..." : "Confirmar"}
              </button>
              <button style={{ ...s.btnClear, flex: 1 }} onClick={() => setRolModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Detalle ── */}
      {detalleModal && (
        <div style={s.overlay} onClick={() => setDetalleModal(null)}>
          <div style={{ ...s.modal, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0, color: ACENTO }}>Detalle usuario</h3>
              <button style={s.closeBtn} onClick={() => setDetalleModal(null)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ textAlign: "center", padding: 20 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: `${ACENTO}22`, border: `3px solid ${ACENTO}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, margin: "0 auto 12px", fontWeight: 900, color: ACENTO,
                }}>
                  {detalleModal.nombre.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>{detalleModal.nombre}</div>
                <div style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>{detalleModal.correo}</div>
                <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 8 }}>
                  <RolBadge rol={detalleModal.rol} />
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                    background: detalleModal.estado === "ACTIVO" ? "#d1fae5" : "#fee2e2",
                    color:      detalleModal.estado === "ACTIVO" ? "#065f46" : "#991b1b",
                  }}>
                    {detalleModal.estado}
                  </span>
                </div>
              </div>
              {[
                ["ID", `#${detalleModal.id}`],
                ["Creado", new Date(detalleModal.creado_en).toLocaleString("es-CO")],
                detalleModal.actualizado_en ? ["Actualizado", new Date(detalleModal.actualizado_en).toLocaleString("es-CO")] : null,
              ].filter(Boolean).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14 }}>
                  <span style={{ color: "#64748b", fontWeight: 600 }}>{k}</span>
                  <span style={{ color: "#1e293b" }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button style={{ ...s.btnPrimary, flex: 1 }} onClick={() => { abrirRolModal(detalleModal); setDetalleModal(null); }}>
                  Cambiar rol
                </button>
                <button
                  style={{ flex: 1, background: detalleModal.estado === "ACTIVO" ? "#f97316" : "#10b981", color: "#fff", border: "none", padding: "9px 16px", borderRadius: 9, fontWeight: 700, cursor: "pointer" }}
                  onClick={() => { handleToggleEstado(detalleModal); setDetalleModal(null); }}
                >
                  {detalleModal.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:        { padding: "30px 36px", maxWidth: 1300, margin: "auto" },
  header:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 },
  title:       { margin: 0, fontSize: "1.9rem", color: "#7c3aed", fontWeight: 900 },
  sub:         { margin: "4px 0 0", color: "#64748b", fontSize: 14 },
  btnBack:     { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", padding: "9px 18px", borderRadius: 9, fontWeight: 600, cursor: "pointer", fontSize: 14 },
  btnPrimary:  { background: "#7c3aed", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 9, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  filtrosBox:  { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, padding: "14px 18px", background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" },
  input:       { padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "#f8fafc", color: "#1e293b" },
  select:      { padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, background: "#f8fafc", color: "#1e293b" },
  btnClear:    { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", padding: "8px 18px", borderRadius: 8, fontWeight: 600, cursor: "pointer" },
  errorBox:    { background: "#fef2f2", color: "#ef4444", padding: "12px 18px", borderRadius: 10, marginBottom: 16 },
  loadingBox:  { textAlign: "center", color: "#64748b", padding: 40 },
  tableWrap:   { background: "#fff", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0", overflow: "auto" },
  table:       { width: "100%", borderCollapse: "collapse", minWidth: 800 },
  th:          { textAlign: "left", padding: "13px 16px", background: "#f8fafc", color: "#64748b", fontSize: 12, fontWeight: 700, borderBottom: "1px solid #e2e8f0", textTransform: "uppercase", letterSpacing: 0.5 },
  tr:          { borderBottom: "1px solid #f1f5f9" },
  td:          { padding: "11px 16px", fontSize: 14, color: "#334155", verticalAlign: "middle" },
  btnAct:      { background: "#7c3aed", color: "#fff", border: "none", padding: "5px 12px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600 },
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal:       { background: "#fff", borderRadius: 16, padding: 28, width: "90%", maxWidth: 520, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  closeBtn:    { background: "#f1f5f9", border: "none", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16, color: "#64748b" },
  label:       { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" },
  toast:       { padding: "12px 18px", borderRadius: 10, marginBottom: 16, fontWeight: 600, fontSize: 14 },
};