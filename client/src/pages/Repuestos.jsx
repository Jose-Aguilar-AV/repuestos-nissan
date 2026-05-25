// client/src/pages/Repuestos.jsx
// RF4 FIX: eliminar el loop `for (let i = 0; i < cantidad; i++) { add(...) }`
// Llamar add() UNA sola vez pasando la cantidad directamente
import { useEffect, useState } from "react";
import { getRepuestos } from "../services/api";
import { useCart } from "../store/cart";

export default function Repuestos() {
  const [data,          setData]          = useState([]);
  const [search,        setSearch]        = useState("");
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [mensaje,       setMensaje]       = useState("");
  const [cantidades,    setCantidades]    = useState({});

  const add   = useCart(state => state.add);
  const items = useCart(state => state.items);

  useEffect(() => {
    getRepuestos().then(setData).catch(console.error);
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
    .slice(0, 10);

  const agregarProducto = (r, stockDisponible) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión");
      window.location.href = "/login";
      return;
    }

    const cantidad = cantidades[r.id_repuesto] || 1;
    if (cantidad <= 0)           { alert("Cantidad inválida"); return; }
    if (cantidad > stockDisponible) { alert("No hay suficiente stock"); return; }

    // RF4 FIX: llamar add() UNA sola vez con la cantidad exacta
    add({
      id_repuesto: r.id_repuesto,
      nombre:      r.nombre,
      descripcion: r.descripcion,
      stock:       r.stock,
      precio:      r.precio,
      cantidad,
    });

    setMensaje(`${cantidad} unidad(es) de ${r.nombre} agregadas`);
    setTimeout(() => setMensaje(""), 2000);
  };

  return (
    <div style={container}>
      {mensaje && <div style={toast}>{mensaje}</div>}

      <h1 style={titleStyle}>Repuestos Nissan</h1>

      <div style={filters}>
        <input
          type="text"
          placeholder="Buscar repuesto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={inputStyle}
        />
        <label style={checkboxLabel}>
          <input
            type="checkbox"
            checked={soloDisponibles}
            onChange={() => setSoloDisponibles(!soloDisponibles)}
          />
          Solo disponibles
        </label>
      </div>

      <div style={grid}>
        {filtrados.map(r => {
          const enCarrito       = items.find(i => i.id_repuesto === r.id_repuesto)?.cantidad || 0;
          const stockDisponible = r.stock - enCarrito;

          return (
            <div key={r.id_repuesto} style={card}>
              <div style={imgStyle}>
                {r.imagen_url
                  ? <img src={r.imagen_url} alt={r.nombre} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                  : "🔧"
                }
              </div>
              <h3 style={nameStyle}>{r.nombre}</h3>
              <p style={descStyle}>{r.descripcion}</p>
              <p style={stockStyle}>
                Stock: <b style={{ color: stockDisponible > 0 ? "green" : "red" }}>{stockDisponible}</b>
              </p>
              {r.precio > 0 && (
                <p style={{ margin: "4px 0 10px", fontSize: 14, color: "#7c3aed", fontWeight: 700 }}>
                  ${Number(r.precio).toLocaleString("es-CO")}
                </p>
              )}
              {enCarrito > 0 && (
                <div style={cartBadge}>En carrito: {enCarrito}</div>
              )}
              <div style={actionsStyle}>
                <input
                  type="number"
                  min="1"
                  max={stockDisponible}
                  value={cantidades[r.id_repuesto] || 1}
                  onChange={e => setCantidades({ ...cantidades, [r.id_repuesto]: Number(e.target.value) })}
                  style={qtyInput}
                />
                <button
                  style={{ ...btnStyle, opacity: stockDisponible <= 0 ? 0.5 : 1, cursor: stockDisponible <= 0 ? "not-allowed" : "pointer" }}
                  disabled={stockDisponible <= 0}
                  onClick={() => agregarProducto(r, stockDisponible)}
                >
                  {stockDisponible > 0 ? "Agregar" : "Sin stock"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const container    = { padding: 30, fontFamily: "sans-serif" };
const titleStyle   = { color: "#c40000", marginBottom: 20 };
const filters      = { display: "flex", gap: 15, marginBottom: 25, alignItems: "center", flexWrap: "wrap" };
const inputStyle   = { padding: 10, borderRadius: 8, border: "1px solid #ccc", width: 250 };
const checkboxLabel= { display: "flex", alignItems: "center", gap: 6, fontSize: 14 };
const grid         = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 };
const card         = { borderRadius: 12, padding: 15, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };
const imgStyle     = { height: 120, background: "#eee", borderRadius: 10, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 };
const nameStyle    = { marginBottom: 5 };
const descStyle    = { fontSize: 14, color: "#666", minHeight: 40 };
const stockStyle   = { margin: "10px 0" };
const cartBadge    = { background: "#ffe5e5", color: "#c40000", padding: "6px 10px", borderRadius: 20, fontSize: 13, marginBottom: 10, display: "inline-block" };
const actionsStyle = { display: "flex", gap: 10, alignItems: "center" };
const qtyInput     = { width: 70, padding: 10, borderRadius: 8, border: "1px solid #ccc", textAlign: "center" };
const btnStyle     = { background: "#c40000", color: "#fff", border: "none", padding: 10, borderRadius: 8, width: "100%" };
const toast        = { position: "fixed", top: 20, right: 20, background: "#28a745", color: "#fff", padding: "12px 20px", borderRadius: 8, zIndex: 999, boxShadow: "0 4px 10px rgba(0,0,0,0.2)" };