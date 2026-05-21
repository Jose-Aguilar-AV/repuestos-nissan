import { useEffect, useState } from "react";
import { getRepuestos } from "../services/api";
import { useCart } from "../store/cart";

export default function Repuestos() {

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cantidades, setCantidades] = useState({});

  const add = useCart(state => state.add);
  const items = useCart(state => state.items);

  useEffect(() => {
    getRepuestos().then(setData);
  }, []);

  const filtrados = data
    .filter(r => {

      const enCarrito =
        items.find(
          i => i.id_repuesto === r.id_repuesto
        )?.cantidad || 0;

      const stockDisponible =
        r.stock - enCarrito;

      const coincideTexto =
        r.nombre
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        r.descripcion
          .toLowerCase()
          .includes(search.toLowerCase());

      const coincideStock =
        soloDisponibles
          ? stockDisponible > 0
          : true;

      return coincideTexto && coincideStock;
    })
    .slice(0, 10);

  const agregarProducto = (r, stockDisponible) => {

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Debes iniciar sesión");
      window.location.href = "/login";
      return;
    }

    const cantidad =
      cantidades[r.id_repuesto] || 1;

    if (cantidad <= 0) {
      alert("Cantidad inválida");
      return;
    }

    if (cantidad > stockDisponible) {
      alert("No hay suficiente stock");
      return;
    }

    for (let i = 0; i < cantidad; i++) {
      add({
        id_repuesto: r.id_repuesto,
        nombre: r.nombre,
        stock: r.stock,
        cantidad,
      });
    }

    setMensaje(
      `${cantidad} unidad(es) de ${r.nombre} agregadas`
    );

    setTimeout(() => {
      setMensaje("");
    }, 2000);
  };

  return (
    <div style={container}>

      {mensaje && (
        <div style={toast}>
          {mensaje}
        </div>
      )}

      <h1 style={title}>
        Repuestos Nissan
      </h1>

      <div style={filters}>

        <input
          type="text"
          placeholder="Buscar repuesto..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={input}
        />

        <label style={checkboxLabel}>
          <input
            type="checkbox"
            checked={soloDisponibles}
            onChange={() =>
              setSoloDisponibles(!soloDisponibles)
            }
          />

          Solo disponibles
        </label>

      </div>

      <div style={grid}>

        {filtrados.map(r => {

          const enCarrito =
            items.find(
              i => i.id_repuesto === r.id_repuesto
            )?.cantidad || 0;

          const stockDisponible =
            r.stock - enCarrito;

          return (
            <div
              key={r.id_repuesto}
              style={card}
            >

              <div style={img}>
                🔧
              </div>

              <h3 style={name}>
                {r.nombre}
              </h3>

              <p style={desc}>
                {r.descripcion}
              </p>

              <p style={stock}>
                Stock:{" "}

                <b
                  style={{
                    color:
                      stockDisponible > 0
                        ? "green"
                        : "red",
                  }}
                >
                  {stockDisponible}
                </b>
              </p>

              {enCarrito > 0 && (
                <div style={cartBadge}>
                  En carrito: {enCarrito}
                </div>
              )}

              <div style={actions}>

                <input
                  type="number"
                  min="1"
                  max={stockDisponible}
                  value={
                    cantidades[r.id_repuesto] || 1
                  }
                  onChange={(e) =>
                    setCantidades({
                      ...cantidades,
                      [r.id_repuesto]:
                        Number(e.target.value),
                    })
                  }
                  style={qtyInput}
                />

                <button
                  style={{
                    ...btn,
                    opacity:
                      stockDisponible <= 0
                        ? 0.5
                        : 1,
                    cursor:
                      stockDisponible <= 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                  disabled={stockDisponible <= 0}
                  onClick={() =>
                    agregarProducto(
                      r,
                      stockDisponible
                    )
                  }
                >
                  {stockDisponible > 0
                    ? "Agregar"
                    : "Sin stock"}
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

/* ESTILOS */

const container = {
  padding: 30,
  fontFamily: "sans-serif",
};

const title = {
  color: "#c40000",
  marginBottom: 20,
};

const filters = {
  display: "flex",
  gap: 15,
  marginBottom: 25,
  alignItems: "center",
  flexWrap: "wrap",
};

const input = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  width: 250,
};

const checkboxLabel = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 14,
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 20,
};

const card = {
  borderRadius: 12,
  padding: 15,
  background: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  transition: "all 0.2s ease",
};

const img = {
  height: 120,
  background: "#eee",
  borderRadius: 10,
  marginBottom: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 40,
};

const name = {
  marginBottom: 5,
};

const desc = {
  fontSize: 14,
  color: "#666",
  minHeight: 40,
};

const stock = {
  margin: "10px 0",
};

const cartBadge = {
  background: "#ffe5e5",
  color: "#c40000",
  padding: "6px 10px",
  borderRadius: 20,
  fontSize: 13,
  marginBottom: 10,
  display: "inline-block",
};

const actions = {
  display: "flex",
  gap: 10,
  alignItems: "center",
};

const qtyInput = {
  width: 70,
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  textAlign: "center",
};

const btn = {
  background: "#c40000",
  color: "#fff",
  border: "none",
  padding: 10,
  borderRadius: 8,
  width: "100%",
};

const toast = {
  position: "fixed",
  top: 20,
  right: 20,
  background: "#28a745",
  color: "#fff",
  padding: "12px 20px",
  borderRadius: 8,
  zIndex: 999,
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
};