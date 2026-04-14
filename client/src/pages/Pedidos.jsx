import { useEffect, useState } from "react";
import { getPedidos } from "../services/api";

export default function Pedidos() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getPedidos().then(setData);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📋 Mis pedidos</h2>

      {data.length === 0 && <p>No hay pedidos</p>}

      {data.map(p => (
        <div key={p.id_pedido} style={card}>
          <h4>Pedido #{p.id_pedido}</h4>
          <p>Estado: {p.estado}</p>
          <p>Fecha: {p.creado_en}</p>
        </div>
      ))}
    </div>
  );
}

const card = {
  border: "1px solid #ccc",
  padding: 10,
  marginBottom: 10,
};