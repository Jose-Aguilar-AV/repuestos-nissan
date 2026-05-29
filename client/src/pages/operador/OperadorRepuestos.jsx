import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRepuestos,
  createRepuesto,
  updateRepuesto,
  ajustarStock,
} from "../../services/api";

const AZUL = "#0ea5e9";

// ─── Subcomponentes ────────────────────────────────────────────────────────────

function StockBadge({ stock }) {
  const color = stock === 0 ? "#ef4444" : stock <= 5 ? "#f97316" : "#10b981";
  const bg    = stock === 0 ? "#fef2f2" : stock <= 5 ? "#fff7ed" : "#f0fdf4";
  return (
    <span style={{
      display: "inline-block",
      background: bg,
      color,
      border: `1px solid ${color}44`,
      borderRadius: 20,
      padding: "2px 10px",
      fontSize: 12,
      fontWeight: 700,
    }}>
      {stock === 0 ? "Sin stock" : stock <= 5 ? `⚠️ ${stock}` : stock}
    </span>
  );
}

function AjusteStock({ repuesto, onClose, onGuardado }) {
  const [delta, setDelta]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const nuevo = repuesto.stock + delta;

  const guardar = async () => {
    if (delta === 0) { onClose(); return; }
    if (nuevo < 0) { setError("El stock no puede quedar negativo"); return; }
    try {
      setLoading(true);
      setError("");
      await ajustarStock(repuesto.id_repuesto, delta);
      onGuardado();
      onClose();
    } catch (e) {
      setError(e.message || "Error al ajustar stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.modal} onClick={e => e.stopPropagation()}>
        <h3 style={m.modalTitle}>Ajustar stock — {repuesto.nombre}</h3>

        <div style={{ marginBottom: 20 }}>
          <div style={m.label}>Stock actual</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: AZUL }}>{repuesto.stock}</div>
        </div>

        <div style={m.label}>Cambio (negativo para reducir)</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <button style={m.stepBtn} onClick={() => setDelta(d => d - 1)}>−</button>
          <input
            type="number"
            value={delta}
            onChange={e => setDelta(Number(e.target.value))}
            style={{ ...m.input, width: 80, textAlign: "center", fontSize: 20, fontWeight: 700 }}
          />
          <button style={m.stepBtn} onClick={() => setDelta(d => d + 1)}>+</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={m.label}>Nuevo stock</div>
          <div style={{
            fontSize: 28, fontWeight: 900,
            color: nuevo < 0 ? "#ef4444" : nuevo <= 5 ? "#f97316" : "#10b981",
          }}>
            {nuevo}
          </div>
        </div>

        {error && <p style={m.error}>{error}</p>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button style={m.btnSecundario} onClick={onClose}>Cancelar</button>
          <button
            style={{ ...m.btnPrimario, opacity: loading ? 0.7 : 1 }}
            onClick={guardar}
            disabled={loading}
          >
            {loading ? "Guardando…" : "Confirmar ajuste"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormRepuesto({ repuesto, onClose, onGuardado }) {
  const esNuevo = !repuesto;
  const [form, setForm] = useState({
    nombre:      repuesto?.nombre      ?? "",
    descripcion: repuesto?.descripcion ?? "",
    precio:      repuesto?.precio      ?? "",
    stock:       repuesto?.stock       ?? 0,
    categoria:   repuesto?.categoria   ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const guardar = async () => {
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return; }
    if (form.precio === "" || isNaN(Number(form.precio))) { setError("El precio debe ser un número"); return; }
    try {
      setLoading(true);
      setError("");
      const payload = { ...form, precio: Number(form.precio), stock: Number(form.stock) };
      if (esNuevo) {
        await createRepuesto(payload);
      } else {
        await updateRepuesto(repuesto.id_repuesto, payload);
      }
      onGuardado();
      onClose();
    } catch (e) {
      setError(e.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "nombre",      label: "Nombre *",      type: "text",   placeholder: "Ej: Filtro de aceite" },
    { key: "categoria",   label: "Categoría",     type: "text",   placeholder: "Ej: Motor, Frenos…"  },
    { key: "precio",      label: "Precio (COP) *", type: "number", placeholder: "0"                   },
    { key: "descripcion", label: "Descripción",   type: "text",   placeholder: "Descripción opcional"  },
  ];

  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={{ ...m.modal, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <h3 style={m.modalTitle}>{esNuevo ? "Nuevo repuesto" : `Editar — ${repuesto.nombre}`}</h3>

        {fields.map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <div style={m.label}>{f.label}</div>
            <input
              type={f.type}
              value={form[f.key]}
              placeholder={f.placeholder}
              onChange={e => set(f.key, e.target.value)}
              style={m.input}
            />
          </div>
        ))}

        {esNuevo && (
          <div style={{ marginBottom: 14 }}>
            <div style={m.label}>Stock inicial</div>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={e => set("stock", e.target.value)}
              style={m.input}
            />
          </div>
        )}

        {error && <p style={m.error}>{error}</p>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button style={m.btnSecundario} onClick={onClose}>Cancelar</button>
          <button
            style={{ ...m.btnPrimario, opacity: loading ? 0.7 : 1 }}
            onClick={guardar}
            disabled={loading}
          >
            {loading ? "Guardando…" : esNuevo ? "Crear repuesto" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function OperadorRepuestos() {
  const navigate = useNavigate();
  const [repuestos, setRepuestos]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [busqueda, setBusqueda]     = useState("");
  const [filtro, setFiltro]         = useState("todos"); // todos | bajo | sin
  const [ajuste, setAjuste]         = useState(null);    // repuesto seleccionado para ajustar stock
  const [editando, setEditando]     = useState(null);    // repuesto | "nuevo"
  const [orden, setOrden]           = useState({ campo: "nombre", asc: true });

  const cargar = useCallback(async () => {
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
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Filtrado + búsqueda + orden
  const lista = repuestos
    .filter(r => {
      if (filtro === "bajo") return r.stock > 0 && r.stock <= 5;
      if (filtro === "sin")  return r.stock === 0;
      return true;
    })
    .filter(r => {
      const q = busqueda.toLowerCase();
      return (
        r.nombre?.toLowerCase().includes(q) ||
        r.categoria?.toLowerCase().includes(q) ||
        String(r.id_repuesto).includes(q)
      );
    })
    .sort((a, b) => {
      const va = a[orden.campo] ?? "";
      const vb = b[orden.campo] ?? "";
      const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
      return orden.asc ? cmp : -cmp;
    });

  const toggleOrden = (campo) =>
    setOrden(o => o.campo === campo ? { campo, asc: !o.asc } : { campo, asc: true });

  const th = (label, campo) => (
    <th
      style={{ ...t.th, cursor: "pointer", userSelect: "none" }}
      onClick={() => toggleOrden(campo)}
    >
      {label} {orden.campo === campo ? (orden.asc ? "↑" : "↓") : ""}
    </th>
  );

  const sinStock  = repuestos.filter(r => r.stock === 0).length;
  const bajoStock = repuestos.filter(r => r.stock > 0 && r.stock <= 5).length;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <button style={s.btnBack} onClick={() => navigate("/operador")}>← Volver</button>
          <h1 style={s.title}>Repuestos</h1>
          <p style={s.sub}>Catálogo, stock y gestión de repuestos</p>
        </div>
        <button style={s.btnPrimary} onClick={() => setEditando("nuevo")}>
          + Nuevo repuesto
        </button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {/* Alertas rápidas */}
      {(sinStock > 0 || bajoStock > 0) && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {sinStock > 0 && (
            <div style={{ ...s.alertChip, background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5" }}>
              ❌ {sinStock} sin stock
            </div>
          )}
          {bajoStock > 0 && (
            <div style={{ ...s.alertChip, background: "#fff7ed", color: "#9a3412", border: "1px solid #fed7aa" }}>
              ⚠️ {bajoStock} con stock crítico
            </div>
          )}
        </div>
      )}

      {/* Controles */}
      <div style={s.controls}>
        <input
          style={s.search}
          placeholder="Buscar por nombre, categoría o ID…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { key: "todos", label: `Todos (${repuestos.length})` },
            { key: "bajo",  label: `Bajo stock (${bajoStock})` },
            { key: "sin",   label: `Sin stock (${sinStock})` },
          ].map(f => (
            <button
              key={f.key}
              style={{ ...s.filtroBtn, ...(filtro === f.key ? s.filtroBtnActive : {}) }}
              onClick={() => setFiltro(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button style={s.btnRefresh} onClick={cargar} title="Actualizar">↻</button>
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={s.center}>Cargando repuestos…</div>
      ) : lista.length === 0 ? (
        <div style={s.center}>No se encontraron repuestos</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={t.table}>
            <thead>
              <tr style={t.trHead}>
                {th("ID",         "id_repuesto")}
                {th("Nombre",     "nombre")}
                {th("Categoría",  "categoria")}
                {th("Precio",     "precio")}
                {th("Stock",      "stock")}
                <th style={t.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((r, i) => (
                <tr
                  key={r.id_repuesto}
                  style={{ ...t.tr, background: i % 2 === 0 ? "#fff" : "#f8fafc" }}
                >
                  <td style={t.td}>
                    <span style={{ color: "#94a3b8", fontWeight: 600 }}>#{r.id_repuesto}</span>
                  </td>
                  <td style={{ ...t.td, fontWeight: 700, color: "#1e293b" }}>{r.nombre}</td>
                  <td style={t.td}>
                    {r.categoria
                      ? <span style={s.catChip}>{r.categoria}</span>
                      : <span style={{ color: "#cbd5e1" }}>—</span>}
                  </td>
                  <td style={t.td}>
                    {r.precio != null
                      ? `$${Number(r.precio).toLocaleString("es-CO")}`
                      : "—"}
                  </td>
                  <td style={t.td}>
                    <StockBadge stock={r.stock ?? 0} />
                  </td>
                  <td style={t.td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        style={s.btnAcc}
                        title="Ajustar stock"
                        onClick={() => setAjuste(r)}
                      >
                        Stock
                      </button>
                      <button
                        style={{ ...s.btnAcc, background: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" }}
                        title="Editar repuesto"
                        onClick={() => setEditando(r)}
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 12, color: "#94a3b8", fontSize: 12 }}>
        Mostrando {lista.length} de {repuestos.length} repuestos
      </div>

      {/* Modales */}
      {ajuste && (
        <AjusteStock
          repuesto={ajuste}
          onClose={() => setAjuste(null)}
          onGuardado={cargar}
        />
      )}
      {editando && (
        <FormRepuesto
          repuesto={editando === "nuevo" ? null : editando}
          onClose={() => setEditando(null)}
          onGuardado={cargar}
        />
      )}
    </div>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────

const s = {
  page:          { padding: "30px 36px", maxWidth: 1200, margin: "auto" },
  header:        { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 },
  title:         { margin: "6px 0 4px", fontSize: "1.8rem", color: AZUL, fontWeight: 800 },
  sub:           { margin: 0, color: "#64748b", fontSize: 14 },
  btnBack:       { background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 6, fontWeight: 600 },
  btnPrimary:    { background: AZUL, color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 15 },
  btnRefresh:    { background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#475569", padding: "8px 14px", borderRadius: 9, cursor: "pointer", fontSize: 16, fontWeight: 700 },
  errorBox:      { background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 18px", marginBottom: 20, fontSize: 14, fontWeight: 600 },
  center:        { textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 16 },
  controls:      { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
  search:        { flex: 1, minWidth: 220, padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none" },
  filtroBtn:     { background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#475569", padding: "8px 14px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  filtroBtnActive: { background: AZUL, color: "#fff", borderColor: AZUL },
  alertChip:     { padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 },
  catChip:       { background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 },
  btnAcc:        { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700 },
};

const t = {
  table:  { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0" },
  trHead: { background: "#f8fafc" },
  th:     { padding: "13px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4, borderBottom: "2px solid #e2e8f0" },
  tr:     { transition: "background 0.1s" },
  td:     { padding: "12px 16px", fontSize: 14, borderBottom: "1px solid #f1f5f9", color: "#334155", verticalAlign: "middle" },
};

const m = {
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modal:        { background: "#fff", borderRadius: 18, padding: "28px 30px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalTitle:   { margin: "0 0 20px", fontSize: 18, fontWeight: 800, color: "#1e293b" },
  label:        { fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 },
  input:        { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 15, outline: "none", boxSizing: "border-box" },
  stepBtn:      { width: 38, height: 38, borderRadius: 9, border: "1px solid #e2e8f0", background: "#f1f5f9", fontSize: 18, fontWeight: 700, cursor: "pointer", color: "#475569" },
  error:        { color: "#ef4444", background: "#fef2f2", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 600, marginBottom: 12 },
  btnPrimario:  { background: AZUL, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 9, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  btnSecundario:{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 9, fontWeight: 700, cursor: "pointer", fontSize: 14 },
};