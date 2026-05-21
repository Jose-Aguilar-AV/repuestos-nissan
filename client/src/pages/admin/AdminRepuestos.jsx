// pages/admin/AdminRepuestos.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRepuestos, editarRepuesto } from "../../services/api";

const ACENTO = "#7c3aed";

// Endpoints de creación y eliminación que necesita el backend
// Se llaman directamente aquí con el helper fetch de services/api
const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function req(url, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { error: text }; }
  if (!res.ok) throw new Error(data?.error || data?.mensaje || `Error ${res.status}`);
  return data;
}

const crearRepuesto = (data) =>
  req("/repuestos", { method: "POST", body: JSON.stringify(data) });

const eliminarRepuesto = (id) =>
  req(`/repuestos/${id}`, { method: "DELETE" });

const actualizarStock = (id, stock) =>
  req(`/repuestos/${id}`, { method: "PUT", body: JSON.stringify({ stock }) });

const FORM_VACIO = {
  nombre: "", descripcion: "", categoria: "",
  marca: "", modelo_compatible: "", stock: 0, precio: 0,
};

const CATEGORIAS = ["Motor", "Frenos", "Suspensión", "Eléctrico", "Transmisión", "Carrocería", "Filtros", "Otros"];

export default function AdminRepuestos() {
  const navigate = useNavigate();

  const [repuestos, setRepuestos] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [toast,     setToast]     = useState("");

  // Filtros
  const [busqueda,  setBusqueda]  = useState("");
  const [filtCat,   setFiltCat]   = useState("");
  const [filtStock, setFiltStock] = useState(""); // "bajo" | "critico" | ""

  // Modal form (crear/editar)
  const [showForm, setShowForm]   = useState(false);
  const [modoEdit, setModoEdit]   = useState(false);
  const [form,     setForm]       = useState(FORM_VACIO);
  const [formId,   setFormId]     = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errForm,   setErrForm]   = useState("");

  // Modal stock rápido
  const [stockModal, setStockModal] = useState(null);
  const [stockVal,   setStockVal]   = useState("");
  const [guardandoS, setGuardandoS] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getRepuestos();
      setRepuestos(data || []);
    } catch (e) {
      setError(e.message || "Error al cargar repuestos");
    } finally {
      setLoading(false);
    }
  };

  const mostrarToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  // ── Abrir crear
  const abrirCrear = () => {
    setModoEdit(false);
    setForm(FORM_VACIO);
    setFormId(null);
    setErrForm("");
    setShowForm(true);
  };

  // ── Abrir editar
  const abrirEditar = (r) => {
    setModoEdit(true);
    setFormId(r.id_repuesto);
    setForm({
      nombre:             r.nombre || "",
      descripcion:        r.descripcion || "",
      categoria:          r.categoria || "",
      marca:              r.marca || "",
      modelo_compatible:  r.modelo_compatible || "",
      stock:              r.stock ?? 0,
      precio:             r.precio ?? 0,
    });
    setErrForm("");
    setShowForm(true);
  };

  // ── Guardar
  const handleGuardar = async () => {
    if (!form.nombre.trim()) { setErrForm("El nombre es obligatorio"); return; }
    if (Number(form.stock)  < 0) { setErrForm("El stock no puede ser negativo"); return; }
    if (Number(form.precio) < 0) { setErrForm("El precio no puede ser negativo"); return; }

    try {
      setGuardando(true);
      setErrForm("");
      const payload = {
        nombre:            form.nombre.trim(),
        descripcion:       form.descripcion.trim() || null,
        categoria:         form.categoria.trim()   || null,
        marca:             form.marca.trim()        || null,
        modelo_compatible: form.modelo_compatible.trim() || null,
        stock:             Number(form.stock),
        precio:            Number(form.precio),
      };
      if (modoEdit) {
        await editarRepuesto(formId, payload);
        mostrarToast("✅ Repuesto actualizado");
      } else {
        await crearRepuesto(payload);
        mostrarToast("✅ Repuesto creado");
      }
      setShowForm(false);
      cargar();
    } catch (e) {
      setErrForm(e.message || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  // ── Eliminar
  const handleEliminar = async (r) => {
    if (!window.confirm(`¿Eliminar "${r.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarRepuesto(r.id_repuesto);
      mostrarToast("🗑️ Repuesto eliminado");
      cargar();
    } catch (e) {
      mostrarToast(`❌ ${e.message || "Error al eliminar"}`);
    }
  };

  // ── Stock rápido
  const abrirStock = (r) => { setStockModal(r); setStockVal(String(r.stock)); };
  const guardarStock = async () => {
    if (!stockModal) return;
    const n = parseInt(stockVal);
    if (isNaN(n) || n < 0) { alert("Stock inválido"); return; }
    try {
      setGuardandoS(true);
      await actualizarStock(stockModal.id_repuesto, n);
      mostrarToast("✅ Stock actualizado");
      setStockModal(null);
      cargar();
    } catch (e) {
      alert(e.message || "Error al actualizar stock");
    } finally {
      setGuardandoS(false);
    }
  };

  // Filtrado
  const repFiltrados = repuestos.filter(r => {
    const b = busqueda.toLowerCase();
    const matchB = !busqueda || r.nombre.toLowerCase().includes(b) ||
      (r.categoria || "").toLowerCase().includes(b) || (r.marca || "").toLowerCase().includes(b) ||
      String(r.id_repuesto).includes(b);
    const matchC = !filtCat || r.categoria === filtCat;
    const matchS = !filtStock
      ? true
      : filtStock === "critico" ? r.stock <= 5
      : filtStock === "bajo"    ? r.stock <= 10
      : true;
    return matchB && matchC && matchS;
  });

  const categorias = [...new Set(repuestos.map(r => r.categoria).filter(Boolean))];

  const stockSummary = {
    critico: repuestos.filter(r => r.stock <= 5).length,
    bajo:    repuestos.filter(r => r.stock > 5 && r.stock <= 10).length,
    ok:      repuestos.filter(r => r.stock > 10).length,
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>🔧 Repuestos</h1>
          <p style={s.sub}>{repFiltrados.length} de {repuestos.length} repuesto(s)</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={s.btnPrimary} onClick={abrirCrear}>+ Nuevo repuesto</button>
          <button style={s.btnBack}    onClick={() => navigate("/admin")}>← Dashboard</button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          ...s.toastBox,
          background: toast.startsWith("✅") ? "#d1fae5" : toast.startsWith("❌") ? "#fee2e2" : "#fff7ed",
          color:      toast.startsWith("✅") ? "#065f46" : toast.startsWith("❌") ? "#991b1b" : "#92400e",
          border:     `1px solid ${toast.startsWith("✅") ? "#6ee7b7" : toast.startsWith("❌") ? "#fca5a5" : "#fcd34d"}`,
        }}>
          {toast}
        </div>
      )}

      {/* Alertas de stock */}
      {stockSummary.critico > 0 && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#92400e" }}>
          <span>⚠️</span>
          <span>{stockSummary.critico} repuesto(s) con stock crítico (≤ 5 unidades)</span>
          <button
            style={{ marginLeft: "auto", background: "#f97316", color: "#fff", border: "none", padding: "4px 12px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 700 }}
            onClick={() => setFiltStock("critico")}
          >
            Filtrar
          </button>
        </div>
      )}

      {/* Resumen stock */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Crítico ≤5",  value: stockSummary.critico, color: "#ef4444", bg: "#fef2f2", border: "#fca5a5", id: "critico" },
          { label: "Bajo ≤10",    value: stockSummary.bajo,    color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d", id: "bajo" },
          { label: "OK >10",      value: stockSummary.ok,      color: "#10b981", bg: "#f0fdf4", border: "#86efac", id: "" },
        ].map(item => (
          <div
            key={item.label}
            onClick={() => setFiltStock(filtStock === item.id ? "" : item.id)}
            style={{
              background: item.bg, border: `2px solid ${filtStock === item.id ? item.color : item.border}`,
              borderRadius: 10, padding: "10px 18px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              transition: "all 0.15s",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={s.filtrosBox}>
        <input
          placeholder="Buscar por nombre, categoría, marca o ID..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ ...s.input, minWidth: 240 }}
        />
        <select value={filtCat} onChange={e => setFiltCat(e.target.value)} style={s.select}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button style={s.btnClear} onClick={() => { setBusqueda(""); setFiltCat(""); setFiltStock(""); }}>
          Limpiar
        </button>
      </div>

      {error   && <div style={s.errorBox}>{error}</div>}
      {loading && <div style={s.loadingBox}>Cargando repuestos...</div>}

      {/* Grid de tarjetas */}
      {!loading && (
        repFiltrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
            Sin repuestos que coincidan con los filtros
          </div>
        ) : (
          <div style={s.grid}>
            {repFiltrados.map(r => {
              const stockColor  = r.stock <= 5 ? "#ef4444" : r.stock <= 10 ? "#f59e0b" : "#10b981";
              const stockBg     = r.stock <= 5 ? "#fef2f2" : r.stock <= 10 ? "#fffbeb" : "#f0fdf4";
              const stockBorder = r.stock <= 5 ? "#fca5a5" : r.stock <= 10 ? "#fcd34d" : "#86efac";

              return (
                <div key={r.id_repuesto} style={s.card}>
                  {/* Badge stock */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>#{r.id_repuesto}</span>
                    <span style={{
                      background: stockBg, color: stockColor, border: `1px solid ${stockBorder}`,
                      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                    }}>
                      {r.stock <= 5 ? "⚠️ " : ""}{r.stock} uds
                    </span>
                  </div>

                  {/* Nombre */}
                  <div style={{ fontSize: 30, textAlign: "center", marginBottom: 8 }}>🔩</div>
                  <h4 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800, color: "#1e293b", textAlign: "center", lineHeight: 1.3 }}>
                    {r.nombre}
                  </h4>

                  {/* Meta */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
                    {r.categoria && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "#94a3b8" }}>Categoría</span>
                        <span style={{ color: "#1e293b", fontWeight: 600 }}>{r.categoria}</span>
                      </div>
                    )}
                    {r.marca && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "#94a3b8" }}>Marca</span>
                        <span style={{ color: "#1e293b", fontWeight: 600 }}>{r.marca}</span>
                      </div>
                    )}
                    {r.modelo_compatible && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "#94a3b8" }}>Modelo</span>
                        <span style={{ color: "#1e293b", fontWeight: 600 }}>{r.modelo_compatible}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#94a3b8" }}>Precio</span>
                      <span style={{ color: ACENTO, fontWeight: 800, fontSize: 15 }}>
                        ${Number(r.precio || 0).toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>

                  {r.descripcion && (
                    <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12, lineHeight: 1.5 }}>
                      {r.descripcion}
                    </p>
                  )}

                  {/* Acciones */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button style={{ ...s.btnAct, flex: 1 }}                        onClick={() => abrirEditar(r)}>Editar</button>
                    <button style={{ ...s.btnAct, flex: 1, background: "#10b981" }} onClick={() => abrirStock(r)}>Stock</button>
                    <button style={{ ...s.btnAct, background: "#ef4444", flex: 1 }} onClick={() => handleEliminar(r)}>Eliminar</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Modal Form Crear/Editar ── */}
      {showForm && (
        <div style={s.overlay} onClick={() => setShowForm(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0, color: ACENTO }}>
                {modoEdit ? `Editar repuesto #${formId}` : "Nuevo repuesto"}
              </h3>
              <button style={s.closeBtn} onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={s.row2f}>
                <div>
                  <label style={s.label}>Nombre *</label>
                  <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} style={s.inp} placeholder="Ej: Filtro de aceite" />
                </div>
                <div>
                  <label style={s.label}>Categoría</label>
                  <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} style={s.inp}>
                    <option value="">Sin categoría</option>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={s.row2f}>
                <div>
                  <label style={s.label}>Marca</label>
                  <input value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} style={s.inp} placeholder="Ej: Nissan" />
                </div>
                <div>
                  <label style={s.label}>Modelo compatible</label>
                  <input value={form.modelo_compatible} onChange={e => setForm(f => ({ ...f, modelo_compatible: e.target.value }))} style={s.inp} placeholder="Ej: Sentra 2018" />
                </div>
              </div>
              <div style={s.row2f}>
                <div>
                  <label style={s.label}>Stock inicial</label>
                  <input type="number" min={0} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} style={s.inp} />
                </div>
                <div>
                  <label style={s.label}>Precio (COP)</label>
                  <input type="number" min={0} step={100} value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} style={s.inp} />
                </div>
              </div>
              <div>
                <label style={s.label}>Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={3} style={{ ...s.inp, resize: "vertical" }} placeholder="Descripción breve del repuesto..." />
              </div>

              {errForm && (
                <div style={{ background: "#fef2f2", color: "#ef4444", padding: "10px 14px", borderRadius: 8, fontSize: 13, border: "1px solid #fca5a5" }}>
                  {errForm}
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ ...s.btnPrimary, flex: 1 }} onClick={handleGuardar} disabled={guardando}>
                  {guardando ? "Guardando..." : modoEdit ? "Actualizar" : "Crear repuesto"}
                </button>
                <button style={{ ...s.btnClear, flex: 1 }} onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Stock Rápido ── */}
      {stockModal && (
        <div style={s.overlay} onClick={() => setStockModal(null)}>
          <div style={{ ...s.modal, maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0, color: ACENTO }}>Actualizar stock</h3>
              <button style={s.closeBtn} onClick={() => setStockModal(null)}>✕</button>
            </div>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 4 }}>
              <strong>{stockModal.nombre}</strong>
            </p>
            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>
              Stock actual: <strong>{stockModal.stock}</strong> unidades
            </p>
            <label style={s.label}>Nuevo stock</label>
            <input
              type="number"
              min={0}
              value={stockVal}
              onChange={e => setStockVal(e.target.value)}
              style={{ ...s.inp, marginBottom: 18 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...s.btnPrimary, flex: 1 }} onClick={guardarStock} disabled={guardandoS}>
                {guardandoS ? "Guardando..." : "Actualizar"}
              </button>
              <button style={{ ...s.btnClear, flex: 1 }} onClick={() => setStockModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:       { padding: "30px 36px", maxWidth: 1400, margin: "auto" },
  header:     { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 },
  title:      { margin: 0, fontSize: "1.9rem", color: "#7c3aed", fontWeight: 900 },
  sub:        { margin: "4px 0 0", color: "#64748b", fontSize: 14 },
  btnBack:    { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", padding: "9px 18px", borderRadius: 9, fontWeight: 600, cursor: "pointer", fontSize: 14 },
  btnPrimary: { background: "#7c3aed", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 9, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  filtrosBox: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, padding: "14px 18px", background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" },
  input:      { padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "#f8fafc", color: "#1e293b" },
  select:     { padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, background: "#f8fafc", color: "#1e293b" },
  btnClear:   { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", padding: "8px 18px", borderRadius: 8, fontWeight: 600, cursor: "pointer" },
  errorBox:   { background: "#fef2f2", color: "#ef4444", padding: "12px 18px", borderRadius: 10, marginBottom: 16 },
  loadingBox: { textAlign: "center", color: "#64748b", padding: 40 },
  grid:       { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 },
  card:       { background: "#fff", borderRadius: 16, padding: "20px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0", transition: "transform 0.15s, box-shadow 0.15s" },
  btnAct:     { background: "#7c3aed", color: "#fff", border: "none", padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 },
  toastBox:   { padding: "12px 18px", borderRadius: 10, marginBottom: 16, fontWeight: 600, fontSize: 14 },
  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal:      { background: "#fff", borderRadius: 16, padding: 28, width: "90%", maxWidth: 580, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalHeader:{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  closeBtn:   { background: "#f1f5f9", border: "none", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16, color: "#64748b" },
  label:      { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" },
  inp:        { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, background: "#f8fafc", color: "#1e293b", boxSizing: "border-box" },
  row2f:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
};