import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPedidos } from "../services/api";

export default function Pedidos() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      getPedidos(user.id).then(setData);
    }
  }, []);



  return (
    <div style={container}>
      <h1 style={title}>Mis pedidos</h1>

      {data.length === 0 ? (
        <p style={empty}>No tienes pedidos aún</p>
      ) : (
        <div style={grid}>
          {data.map(p => (
            <div key={p.id_pedido} style={card}>
              <h3 style={pedido}>Pedido #{p.id_pedido}</h3>

              <p>
                <b>Estado:</b>{" "}
                <span style={estado}>
                  {p.nombre_estado}
                </span>
              </p>

              <p>
                <b>Fecha:</b>{" "}
                {new Date(p.fecha_creacion).toLocaleString()}
              </p>

              <button
                style={btnVer}
                onClick={() => navigate(`/pedido/${p.id_pedido}`)}
              >
                Ver detalle
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* 🎨 ESTILOS */

const container = {
  padding: 30,
  maxWidth: 1000,
  margin: "auto",
};

const title = {
  color: "#c40000",
  marginBottom: 20,
};

const empty = {
  textAlign: "center",
  color: "#777",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
};

const card = {
  padding: 20,
  borderRadius: 12,
  background: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  transition: "0.2s",
};

const pedido = {
  marginBottom: 10,
};

const estado = {
  color: "#c40000",
  fontWeight: "bold",
};

const btnVer = {
  marginTop: 10,
  padding: 10,
  width: "100%",
  border: "1px solid #c40000",
  background: "transparent",
  color: "#c40000",
  borderRadius: 8,
  cursor: "pointer",
};