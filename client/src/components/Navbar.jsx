import { Link } from "react-router-dom";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <nav style={nav}>
      {/* 🔴 Logo */}
      <div style={logo}>
        <span style={{ color: "#c40000" }}>Nissan</span> Parts
      </div>

      {/* 🔗 Links */}
      <div style={links}>
        <Link to="/" style={link}>Inicio</Link>
        <Link to="/repuestos" style={link}>Repuestos</Link>

        {user && (
          <>
            <Link to="/pedido/nuevo" style={link}>
              Carrito
            </Link>

            <Link to="/pedidos" style={link}>
              Mis pedidos
            </Link>
          </>
        )}
      </div>

      {/* 👤 Usuario */}
      <div style={userSection}>
        {!user ? (
          <Link to="/login" style={loginBtn}>
            Iniciar sesión
          </Link>
        ) : (
          <>
            <span style={userName}>
              👤 {user.nombre}
            </span>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
              style={logoutBtn}
            >
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

/* 🎨 ESTILOS */

const nav = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 30px",
  background: "#111",
  color: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
};

const logo = {
  fontSize: 20,
  fontWeight: "bold",
};

const links = {
  display: "flex",
  gap: 20,
};

const link = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: "500",
  transition: "0.2s",
};

const userSection = {
  display: "flex",
  alignItems: "center",
  gap: 15,
};

const loginBtn = {
  background: "#c40000",
  color: "#fff",
  padding: "8px 14px",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: "bold",
};

const logoutBtn = {
  background: "transparent",
  color: "#fff",
  border: "1px solid #c40000",
  padding: "6px 12px",
  borderRadius: 8,
  cursor: "pointer",
};

const userName = {
  fontSize: 14,
  color: "#ccc",
};