// ─────────────────────────────────────────────────────────────────────────────
// components/Navbar.jsx  ─  Navbar dinámico según rol
// ─────────────────────────────────────────────────────────────────────────────
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ShoppingCart, ClipboardList, LayoutDashboard, Package, Users, BarChart2, PlusCircle } from "lucide-react";

const ROL_COLOR = {
  ADMINISTRADOR: "#7c3aed",
  OPERADOR:      "#0ea5e9",
  CLIENTE:       "#c40000",
};

const ROL_BADGE = {
  ADMINISTRADOR: "Admin",
  OPERADOR:      "Operador",
  CLIENTE:       "Cliente",
};

export default function Navbar() {
  const { user, loggedIn, logout, isAdmin, isOperador, isCliente } = useAuth();
  const loc = useLocation();

  const accentColor = user ? (ROL_COLOR[user.rol] || "#c40000") : "#c40000";

  const link = (to, label) => (
    <Link
      key={to}
      to={to}
      style={{
        ...styles.link,
        borderBottom: loc.pathname.startsWith(to) ? `2px solid ${accentColor}` : "2px solid transparent",
        color: loc.pathname.startsWith(to) ? accentColor : "#ddd",
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <Link to="/" style={styles.logo}>
        <span style={{ color: accentColor }}>Nissan</span> Parts
      </Link>

      {/* Links según rol */}
      <div style={styles.links}>
        {link("/repuestos", "Repuestos")}

        {isCliente && (
          <>
            {link("/pedido/nuevo",  "Carrito")}
            {link("/mis-pedidos",   "Mis pedidos")}
          </>
        )}

        {isOperador && !isAdmin && (
          <>
            {link("/operador",         "Panel")}
            {link("/operador/pedidos", "Pedidos")}
            {link("/operador/analytics","Analytics")}
          </>
        )}

        {isAdmin && (
          <>
            {link("/admin",            "Dashboard")}
            {link("/admin/pedidos",    "Pedidos")}
            {link("/admin/usuarios",   "Usuarios")}
            {link("/admin/analytics",  "Analytics")}
            {link("/pedido/nuevo",  "Carrito")}
            {link("/mis-pedidos",   "Mis pedidos")}
          </>
        )}
      </div>

      {/* Usuario */}
      <div style={styles.userSection}>
        {!loggedIn ? (
          <Link to="/login" style={{ ...styles.btn, background: accentColor }}>
            Iniciar sesión
          </Link>
        ) : (
          <>
            <span style={styles.nombre}>{user.nombre}</span>
            <span
              style={{
                ...styles.badge,
                background: accentColor + "22",
                color: accentColor,
                border: `1px solid ${accentColor}44`,
              }}
            >
              {ROL_BADGE[user.rol] || user.rol}
            </span>
            <button onClick={logout} style={styles.logoutBtn}>
              Salir
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 28px",
    background: "#111",
    color: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    gap: 20,
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textDecoration: "none",
    flexShrink: 0,
  },
  links: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  link: {
    color: "#ddd",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: 14,
    padding: "6px 10px",
    borderRadius: 6,
    transition: "all 0.2s",
    borderBottom: "2px solid transparent",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  nombre: {
    fontSize: 14,
    color: "#ccc",
  },
  badge: {
    fontSize: 12,
    padding: "3px 8px",
    borderRadius: 20,
    fontWeight: 700,
  },
  btn: {
    color: "#fff",
    padding: "7px 14px",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: 14,
  },
  logoutBtn: {
    background: "transparent",
    color: "#ccc",
    border: "1px solid #555",
    padding: "6px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
  },
};