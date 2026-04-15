import { Link } from "react-router-dom";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div
      style={{
        padding: 15,
        background: "#111",
        color: "#fff",
        display: "flex",
        gap: 15,
      }}
    >
      <Link to="/" style={link}>Inicio</Link>
      <Link to="/repuestos" style={link}>Repuestos</Link>

      {!user && (
        <Link to="/login" style={link}>
          Login
        </Link>
      )}

      {user && (
        <>
          <Link to="/pedido/nuevo" style={link}>
            Carrito
          </Link>

          <Link to="/pedidos" style={link}>
            Mis pedidos
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            style={btn}
          >
            Cerrar sesión
          </button>
        </>
      )}
    </div>
  );
}

const link = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: "bold",
};

const btn = {
  background: "#c40000",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  cursor: "pointer",
};