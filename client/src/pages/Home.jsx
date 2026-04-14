import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ color: "#c40000" }}>
        🔧 Sistema de Repuestos Nissan
      </h1>

      <p>Selecciona una opción:</p>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <Link to="/repuestos" style={btn}>
          🚗 Ver Repuestos
        </Link>

        <Link to="/pedido/nuevo" style={btn}>
          🛒 Crear Pedido
        </Link>

        <Link to="/pedidos" style={btn}>
          📋 Ver Pedidos
        </Link>
      </div>
    </div>
  );
}

const btn = {
  padding: "15px 20px",
  background: "#c40000",
  color: "white",
  textDecoration: "none",
  borderRadius: 10,
};