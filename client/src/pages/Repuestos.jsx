import { useEffect, useState } from "react";
import { getRepuestos } from "../services/api";
import { useCart } from "../store/cart";

export default function Repuestos() {
  const [data, setData] = useState([]);
  const add = useCart(state => state.add);

  useEffect(() => {
    getRepuestos().then(setData);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ color: "#c40000" }}>Repuestos Nissan</h1>

      <div style={grid}>
        {data.map(r => (
          <div key={r.id_repuesto} style={card}>
            <div style={img}></div>

            <h3>{r.nombre}</h3>
            <p>{r.descripcion}</p>

            <p><b>Stock:</b> {r.stock}</p>

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
              🛒 Agregar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 20,
};

const card = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 15,
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const img = {
  height: 120,
  background: "#eee",
  borderRadius: 10,
  marginBottom: 10,
};

const btn = {
  background: "#c40000",
  color: "#fff",
  border: "none",
  padding: 10,
  borderRadius: 8,
  cursor: "pointer",
};