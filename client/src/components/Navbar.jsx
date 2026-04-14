import { Link } from "react-router-dom";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <nav style={nav}>
      <h2 style={{ color: "#fff" }}>Nissan Store 🚗</h2>

      <div>
        <Link to="/" style={link}>Inicio</Link>
        <Link to="/repuestos" style={link}>Repuestos</Link>

        {user && (
          <>
            <Link to="/pedido/nuevo" style={link}>Carrito</Link>
            <Link to="/pedidos" style={link}>Mis pedidos</Link>
          </>
        )}

        {!user && (
          <Link to="/login" style={link}>Login</Link>
        )}
      </div>
    </nav>
  );
}

const nav = {
  background: "#111",
  padding: 15,
  display: "flex",
  justifyContent: "space-between",
};

const link = {
  color: "#fff",
  marginLeft: 15,
  textDecoration: "none",
};