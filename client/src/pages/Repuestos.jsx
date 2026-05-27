// client/src/pages/Repuestos.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRepuestos } from "../services/api";
import { useCart } from "../store/cart";

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
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };
  const remove = id => setToasts(prev => prev.filter(t => t.id !== id));
  return { toasts, push, remove };
}

/* ── Main ────────────────────────────────────────────────────── */
export default function Repuestos() {
  const navigate = useNavigate();
  const [data,            setData]            = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState("");
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [cantidades,      setCantidades]      = useState({});
  const [addedMap,        setAddedMap]        = useState({}); // para animación del botón

  const add   = useCart(s => s.add);
  const items = useCart(s => s.items);
  const { toasts, push, remove: removeToast } = useToasts();

  useEffect(() => {
    setLoading(true);
    getRepuestos()
      .then(d => { setData(d || []); setLoading(false); })
      .catch(e => { push(e.message || "Error al cargar repuestos", "error"); setLoading(false); });
  }, []);

  const filtrados = data
    .filter(r => {
      const enCarrito       = items.find(i => i.id_repuesto === r.id_repuesto)?.cantidad || 0;
      const stockDisponible = r.stock - enCarrito;
      const texto = (r.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
                    (r.descripcion || "").toLowerCase().includes(search.toLowerCase());
      const stockOk = soloDisponibles ? stockDisponible > 0 : true;
      return texto && stockOk;
    })
    .slice(0, 12);

  const agregarProducto = (r, stockDisponible) => {
    const token = localStorage.getItem("token");
    if (!token) { push("Debes iniciar sesión para agregar al carrito", "error"); window.location.href = "/login"; return; }
    const cantidad = cantidades[r.id_repuesto] || 1;
    if (cantidad <= 0)              { push("La cantidad debe ser mayor a 0", "warn"); return; }
    if (cantidad > stockDisponible) { push(`Solo hay ${stockDisponible} unidades disponibles de "${r.nombre}"`, "warn"); return; }

    add({ id_repuesto: r.id_repuesto, nombre: r.nombre, descripcion: r.descripcion, stock: r.stock, precio: r.precio, cantidad });
    push(`${cantidad} unidad${cantidad !== 1 ? "es" : ""} de "${r.nombre}" agregada${cantidad !== 1 ? "s" : ""} al carrito`);

    // Animación de botón
    setAddedMap(prev => ({ ...prev, [r.id_repuesto]: true }));
    setTimeout(() => setAddedMap(prev => ({ ...prev, [r.id_repuesto]: false })), 1200);
  };

  const totalEnCarrito = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header band */}
      <div style={{ background: "#fff", borderBottom: "1px solid #ececec", padding: "28px 32px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 700, color: "#111827", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                Repuestos <span style={{ color: "#c40000" }}>Nissan</span>
              </h1>
              {!loading && (
                <p style={{ color: "#6b7280", margin: 0, fontSize: 14 }}>
                  {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
                  {data.length > 12 ? ` · mostrando los primeros 12` : ""}
                </p>
              )}
            </div>

            {/* Cart pill */}
            {totalEnCarrito > 0 && (
              <div
                onClick={() => navigate("/carrito")}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 40, padding: "10px 20px", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff5f5"}
              >
                <span style={{ fontSize: 18 }}>🛒</span>
                <span style={{ fontWeight: 700, color: "#c40000", fontSize: 14 }}>{totalEnCarrito} en carrito</span>
                <span style={{ color: "#fca5a5", fontSize: 14 }}>→</span>
              </div>
            )}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 360 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 16, pointerEvents: "none" }}>🔍</span>
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px 10px 42px", borderRadius: 12,
                  border: "1px solid #e5e7eb", background: "#f9fafb", fontFamily: "inherit",
                  fontSize: 14, outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => e.target.style.borderColor = "#c40000"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>

            {/* Toggle disponibles */}
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
              <div
                onClick={() => setSoloDisponibles(!soloDisponibles)}
                style={{
                  width: 44, height: 24, borderRadius: 12, position: "relative", cursor: "pointer",
                  background: soloDisponibles ? "#c40000" : "#e5e7eb", transition: "background 0.2s",
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", background: "#fff",
                  position: "absolute", top: 3, transition: "left 0.2s",
                  left: soloDisponibles ? 23 : 3,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                }} />
              </div>
              <span style={{ fontSize: 13, color: "#4b5563", fontWeight: 500 }}>Solo disponibles</span>
            </label>

            {/* Clear search */}
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "transparent", border: "1px solid #e5e7eb", color: "#9ca3af", padding: "9px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
                Limpiar ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px" }}>

        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: "#fff", borderRadius: 18, padding: 18, border: "1px solid #ececec", animation: `pulse 1.5s ease-in-out ${i*0.1}s infinite` }}>
                <div style={{ height: 130, borderRadius: 12, background: "#f3f4f6", marginBottom: 14 }} />
                <div style={{ height: 14, borderRadius: 6, background: "#f3f4f6", marginBottom: 8, width: "70%" }} />
                <div style={{ height: 11, borderRadius: 6, background: "#f3f4f6", width: "90%" }} />
              </div>
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
          </div>
        )}

        {!loading && filtrados.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <span style={{ fontSize: 48, display: "block", marginBottom: 14 }}>🔍</span>
            <p style={{ color: "#9ca3af", fontSize: 17, margin: 0 }}>No se encontraron repuestos</p>
            {search && <button onClick={() => setSearch("")} style={{ marginTop: 16, background: "#c40000", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Limpiar búsqueda</button>}
          </div>
        )}

        {!loading && filtrados.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {filtrados.map((r, i) => {
              const enCarrito       = items.find(it => it.id_repuesto === r.id_repuesto)?.cantidad || 0;
              const stockDisponible = r.stock - enCarrito;
              const sinStock        = stockDisponible <= 0;
              const justAdded       = addedMap[r.id_repuesto];

              return (
                <div
                  key={r.id_repuesto}
                  style={{
                    background: "#fff", borderRadius: 18, padding: 18,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #ececec",
                    display: "flex", flexDirection: "column", gap: 0,
                    animation: `slideIn 0.3s ease ${i * 0.04}s both`,
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.10)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"}
                >
                  {/* Imagen */}
                  <div style={{ height: 130, background: "#fff5f5", borderRadius: 12, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, border: "1px solid #fecaca", overflow: "hidden", flexShrink: 0 }}>
                    {r.imagen_url
                      ? <img src={r.imagen_url} alt={r.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : "🔧"
                    }
                  </div>

                  {/* Nombre clickeable */}
                  <h3
                    onClick={() => navigate(`/repuesto/${r.id_repuesto}`)}
                    style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#c40000", cursor: "pointer", lineHeight: 1.3 }}
                    title="Ver detalle"
                  >
                    {r.nombre}
                  </h3>

                  {/* Descripción */}
                  <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6b7280", lineHeight: 1.5, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {r.descripcion || "—"}
                  </p>

                  {/* Precio + stock row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    {r.precio > 0 ? (
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                        ${Number(r.precio).toLocaleString("es-CO")}
                      </span>
                    ) : <span />}

                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                      background: sinStock ? "#fef2f2" : stockDisponible <= 3 ? "#fffbeb" : "#f0fdf4",
                      color:      sinStock ? "#dc2626" : stockDisponible <= 3 ? "#d97706" : "#16a34a",
                      border: `1px solid ${sinStock ? "#fca5a5" : stockDisponible <= 3 ? "#fcd34d" : "#86efac"}`,
                    }}>
                      {sinStock ? "Sin stock" : `Stock: ${stockDisponible}`}
                    </span>
                  </div>

                  {/* Badge carrito */}
                  {enCarrito > 0 && (
                    <div style={{ background: "#fff5f5", color: "#c40000", border: "1px solid #fecaca", padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 10, display: "inline-flex", alignItems: "center", gap: 5, alignSelf: "flex-start" }}>
                      🛒 {enCarrito} en carrito
                    </div>
                  )}

                  {/* Agregar al carrito */}
                  <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                    <input
                      type="number" min="1" max={stockDisponible || 1}
                      value={cantidades[r.id_repuesto] || 1}
                      onChange={e => setCantidades(prev => ({ ...prev, [r.id_repuesto]: Math.max(1, Number(e.target.value)) }))}
                      disabled={sinStock}
                      style={{ width: 62, padding: "9px 10px", borderRadius: 10, border: "1px solid #e5e7eb", textAlign: "center", fontFamily: "inherit", fontSize: 14, background: sinStock ? "#f9fafb" : "#fff", color: sinStock ? "#9ca3af" : "#111827", outline: "none" }}
                    />
                    <button
                      disabled={sinStock}
                      onClick={() => agregarProducto(r, stockDisponible)}
                      style={{
                        flex: 1, padding: "9px 12px", borderRadius: 10, border: "none",
                        background: justAdded ? "#16a34a" : sinStock ? "#f3f4f6" : "linear-gradient(135deg,#c40000,#ff2a2a)",
                        color: sinStock ? "#9ca3af" : "#fff",
                        fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: sinStock ? "not-allowed" : "pointer",
                        transition: "background 0.3s",
                        boxShadow: sinStock || justAdded ? "none" : "0 4px 12px rgba(196,0,0,0.2)",
                      }}
                    >
                      {justAdded ? "✓ Agregado" : sinStock ? "Sin stock" : "Agregar →"}
                    </button>
                  </div>

                  {/* Ver ficha */}
                  <button
                    onClick={() => navigate(`/repuesto/${r.id_repuesto}`)}
                    style={{ background: "transparent", border: "none", color: "#9ca3af", fontSize: 12, cursor: "pointer", textAlign: "left", padding: "10px 0 0", fontWeight: 500, fontFamily: "inherit" }}
                  >
                    Ver ficha completa →
                  </button>
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