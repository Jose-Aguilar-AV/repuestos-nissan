import { useEffect, useState } from "react";
import { getRepuestos } from "../services/api";
import { useCart } from "../store/cart";

export default function Repuestos() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  const add = useCart(state => state.add);

  useEffect(() => {
    getRepuestos().then(setData);
  }, []);

  const filtrados = data.filter(r => {
    const coincideTexto =
      r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(search.toLowerCase());

    const coincideStock = soloDisponibles ? r.stock > 0 : true;

    return coincideTexto && coincideStock;
  });

  return (
    <div style={container}>
      <h1 style={title}>Repuestos Nissan</h1>

      {/* 🔍 FILTROS */}
      <div style={filters}>
        <input
          type="text"
          placeholder="Buscar repuesto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
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

      {/* 📦 GRID */}
      <div style={grid}>
        {filtrados.map(r => (
          <div key={r.id_repuesto} style={card} className="card">

            <div style={img}></div>

            <h3 style={name}>{r.nombre}</h3>
            <p style={desc}>{r.descripcion}</p>

            <p style={stock}>
              Stock: <b style={{ color: r.stock > 0 ? "green" : "red" }}>
                {r.stock}
              </b>
            </p>

            <button
              style={btn}
              onClick={() => {
                const token = localStorage.getItem("token");

                if (!token) {
                  alert("Debes iniciar sesión");
                  window.location.href = "/login";
                  return;
                }

                add({ id_repuesto: r.id_repuesto, cantidad: 1 });
              }}
            >
              Agregar
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}

/* 🎨 ESTILOS */

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
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
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
};

const name = {
  marginBottom: 5,
};

const desc = {
  fontSize: 14,
  color: "#666",
};

const stock = {
  margin: "10px 0",
};

const btn = {
  background: "#c40000",
  color: "#fff",
  border: "none",
  padding: 10,
  borderRadius: 8,
  cursor: "pointer",
  width: "100%",
};

