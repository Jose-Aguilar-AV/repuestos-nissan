import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={container}>
      
      <div style={header}>
        <h1 style={title}>Sistema de Repuestos Nissan</h1>
        <p style={subtitle}>Gestiona repuestos, pedidos y consultas</p>
      </div>

      <div style={grid}>
        <Link to="/repuestos" style={card} className="card">
          <h3 style={cardTitle}>Repuestos</h3>
          <p style={cardText}>
            Consulta disponibilidad y detalles de los repuestos
          </p>
        </Link>

        <Link to="/pedido/nuevo" style={card} className="card">
          <h3 style={cardTitle}>Crear Pedido</h3>
          <p style={cardText}>
            Genera un nuevo pedido de repuestos
          </p>
        </Link>

        <Link to="/pedidos" style={card} className="card">
          <h3 style={cardTitle}>Pedidos</h3>
          <p style={cardText}>
            Revisa el historial y estado de los pedidos
          </p>
        </Link>
      </div>

    </div>
  );
}

/* 🎨 ESTILOS */

const container = {
  minHeight: "100vh",
  padding: 40,
  background: "#f5f6fa",
  fontFamily: "sans-serif",
};

const header = {
  textAlign: "center",
  marginBottom: 50,
};

const title = {
  color: "#c40000",
  fontSize: 36,
  marginBottom: 10,
};

const subtitle = {
  color: "#666",
  fontSize: 18,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 25,
  maxWidth: 900,
  margin: "auto",
};

const card = {
  padding: 30,
  borderRadius: 16,
  background: "#ffffff",
  textDecoration: "none",
  color: "#333",
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  transition: "all 0.25s ease",
};

const cardTitle = {
  marginBottom: 10,
  fontSize: 20,
  color: "#c40000",
};

const cardText = {
  fontSize: 15,
  color: "#666",
};