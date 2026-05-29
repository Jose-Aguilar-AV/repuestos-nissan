import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRepuesto } from "../services/api";
import { useCart } from "../store/cart";

export default function DetalleProducto() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [producto,   setProducto]  = useState(null);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState("");
  const [cantidad,   setCantidad]  = useState(1);
  const [agregado,   setAgregado]  = useState(false);

  const add   = useCart(state => state.add);
  const items = useCart(state => state.items);

  useEffect(() => {
    setLoading(true);
    setError("");
    getRepuesto(id)
      .then(data => { setProducto(data); setLoading(false); })
      .catch(() => { setError("No se encontró el repuesto."); setLoading(false); });
  }, [id]);

  const enCarrito       = items.find(i => i.id_repuesto === Number(id))?.cantidad || 0;
  const stockDisponible = producto ? producto.stock - enCarrito : 0;

  const agregar = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión");
      navigate("/login");
      return;
    }
    if (cantidad < 1 || cantidad > stockDisponible) {
      alert("Cantidad inválida");
      return;
    }
    add({
      id_repuesto: producto.id_repuesto,
      nombre:      producto.nombre,
      descripcion: producto.descripcion,
      stock:       producto.stock,
      precio:      producto.precio,
      cantidad,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  /* ── ESTADOS DE CARGA / ERROR ── */
  if (loading) return (
    <div style={s.center}>
      <div style={s.spinner} />
      <p style={{ color: "#64748b", marginTop: 16 }}>Cargando repuesto...</p>
    </div>
  );

  if (error) return (
    <div style={s.center}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <p style={{ color: "#ef4444", fontSize: 18 }}>{error}</p>
      <button style={s.btnVolver} onClick={() => navigate("/repuestos")}>← Volver al catálogo</button>
    </div>
  );

  const stockColor =
    stockDisponible <= 0  ? "#ef4444" :
    stockDisponible <= 5  ? "#f59e0b" : "#10b981";

  const stockLabel =
    stockDisponible <= 0  ? "Sin stock" :
    stockDisponible <= 5  ? `Últimas ${stockDisponible} unidades` :
    `${stockDisponible} disponibles`;

  return (
    <div style={s.page}>
      {/* Breadcrumb */}
      <div style={s.breadcrumb}>
        <span style={s.breadLink} onClick={() => navigate("/")}>Inicio</span>
        <span style={s.sep}>/</span>
        <span style={s.breadLink} onClick={() => navigate("/repuestos")}>Repuestos</span>
        <span style={s.sep}>/</span>
        <span style={{ color: "#64748b" }}>{producto.nombre}</span>
      </div>

      <div style={s.layout}>
        {/* ── IMAGEN ── */}
        <div style={s.imgBox}>
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              style={s.img}
              onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
            />
          ) : null}
          <div style={{ ...s.imgPlaceholder, display: producto.imagen_url ? "none" : "flex" }}>
            <span style={{ fontSize: 80 }}>🔧</span>
          </div>
        </div>

        {/* ── INFO ── */}
        <div style={s.info}>
          {/* Categoría badge */}
          {producto.categoria && (
            <span style={s.categoriaBadge}>{producto.categoria}</span>
          )}

          <h1 style={s.nombre}>{producto.nombre}</h1>

          {/* ID interno */}
          <p style={s.idText}>Referencia #{producto.id_repuesto}</p>

          {/* Precio */}
          {producto.precio > 0 ? (
            <div style={s.precio}>
              ${Number(producto.precio).toLocaleString("es-CO")}
              <span style={s.precioCOP}>COP</span>
            </div>
          ) : (
            <div style={{ ...s.precio, color: "#94a3b8", fontSize: 18 }}>Precio a consultar</div>
          )}

          {/* Stock */}
          <div style={s.stockRow}>
            <span style={{ ...s.stockDot, background: stockColor }} />
            <span style={{ color: stockColor, fontWeight: 700, fontSize: 14 }}>{stockLabel}</span>
            {enCarrito > 0 && (
              <span style={s.enCarritoBadge}>🛒 {enCarrito} en carrito</span>
            )}
          </div>

          {/* Compatibilidad */}
          {(producto.marca || producto.modelo_compatible) && (
            <div style={s.compatBox}>
              <p style={s.compatTitle}>Compatibilidad</p>
              <div style={s.compatGrid}>
                {producto.marca && (
                  <div style={s.compatItem}>
                    <span style={s.compatLabel}>Marca</span>
                    <span style={s.compatVal}>{producto.marca}</span>
                  </div>
                )}
                {producto.modelo_compatible && (
                  <div style={s.compatItem}>
                    <span style={s.compatLabel}>Modelo</span>
                    <span style={s.compatVal}>{producto.modelo_compatible}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Descripción */}
          {producto.descripcion && (
            <div style={s.descBox}>
              <p style={s.descTitle}>Descripción</p>
              <p style={s.desc}>{producto.descripcion}</p>
            </div>
          )}

          {/* Agregar al carrito */}
          {stockDisponible > 0 ? (
            <div style={s.cartRow}>
              <div style={s.qtyBox}>
                <button
                  style={s.qtyBtn}
                  onClick={() => setCantidad(c => Math.max(1, c - 1))}
                >−</button>
                <input
                  type="number"
                  min={1}
                  max={stockDisponible}
                  value={cantidad}
                  onChange={e => setCantidad(Math.min(stockDisponible, Math.max(1, Number(e.target.value))))}
                  style={s.qtyInput}
                />
                <button
                  style={s.qtyBtn}
                  onClick={() => setCantidad(c => Math.min(stockDisponible, c + 1))}
                >+</button>
              </div>

              <button
                style={{
                  ...s.btnAgregar,
                  background: agregado ? "#28a745" : "#c40000",
                }}
                onClick={agregar}
              >
                {agregado ? "✓ Agregado al carrito" : "🛒 Agregar al carrito"}
              </button>
            </div>
          ) : (
            <div style={s.sinStockBox}>
              <p style={{ color: "#ef4444", fontWeight: 700, margin: 0 }}>
                Producto sin stock disponible
              </p>
              <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0" }}>
                Contáctanos para información de disponibilidad
              </p>
            </div>
          )}

          <button style={s.btnVolver} onClick={() => navigate("/repuestos")}>
            ← Volver al catálogo
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── ESTILOS ── */
const s = {
  page: {
    maxWidth: 1100,
    margin: "auto",
    padding: "30px 24px",
    fontFamily: "sans-serif",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
    gap: 12,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #c40000",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 24,
  },
  breadLink: {
    color: "#c40000",
    cursor: "pointer",
    fontWeight: 600,
  },
  sep: { color: "#cbd5e1" },

  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 420px) 1fr",
    gap: 40,
    alignItems: "start",
  },

  imgBox: {
    borderRadius: 20,
    overflow: "hidden",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    aspectRatio: "1 / 1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  imgPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    minHeight: 280,
  },

  info: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  categoriaBadge: {
    display: "inline-block",
    background: "#fee2e2",
    color: "#c40000",
    fontSize: 12,
    fontWeight: 700,
    padding: "4px 12px",
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  nombre: {
    fontSize: 28,
    fontWeight: 800,
    color: "#1e293b",
    margin: 0,
    lineHeight: 1.2,
  },
  idText: {
    fontSize: 13,
    color: "#94a3b8",
    margin: 0,
  },
  precio: {
    fontSize: 32,
    fontWeight: 900,
    color: "#c40000",
    display: "flex",
    alignItems: "baseline",
    gap: 8,
  },
  precioCOP: {
    fontSize: 14,
    fontWeight: 500,
    color: "#94a3b8",
  },

  stockRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  stockDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
  enCarritoBadge: {
    background: "#ffe5e5",
    color: "#c40000",
    fontSize: 12,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 20,
    marginLeft: 8,
  },

  compatBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "14px 16px",
  },
  compatTitle: {
    margin: "0 0 10px",
    fontSize: 13,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  compatGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  compatItem: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  compatLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: 600,
    textTransform: "uppercase",
  },
  compatVal: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: 700,
  },

  descBox: {
    borderTop: "1px solid #f1f5f9",
    paddingTop: 16,
  },
  descTitle: {
    margin: "0 0 8px",
    fontSize: 13,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  desc: {
    margin: 0,
    fontSize: 15,
    color: "#475569",
    lineHeight: 1.7,
  },

  cartRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  qtyBox: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
    background: "#fff",
  },
  qtyBtn: {
    width: 40,
    height: 44,
    border: "none",
    background: "#f8fafc",
    color: "#c40000",
    fontSize: 20,
    fontWeight: 700,
    cursor: "pointer",
  },
  qtyInput: {
    width: 60,
    height: 44,
    border: "none",
    borderLeft: "1px solid #e2e8f0",
    borderRight: "1px solid #e2e8f0",
    textAlign: "center",
    fontSize: 16,
    fontWeight: 700,
    color: "#1e293b",
    background: "#fff",
    outline: "none",
  },
  btnAgregar: {
    flex: 1,
    padding: "13px 20px",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.2s",
    minWidth: 200,
  },
  sinStockBox: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    borderRadius: 12,
    padding: "14px 18px",
  },
  btnVolver: {
    background: "transparent",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    padding: "10px 20px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    alignSelf: "flex-start",
  },
};