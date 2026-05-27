// ─────────────────────────────────────────────────────────────────────────────
// components/Navbar.jsx  ─  Navbar dinámico según rol
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/* ── Config por rol ──────────────────────────────────────────── */
const ROL_CFG = {
  ADMINISTRADOR: { color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd", label: "Admin" },
  OPERADOR:      { color: "#0ea5e9", bg: "#eff6ff", border: "#93c5fd", label: "Operador" },
  CLIENTE:       { color: "#c40000", bg: "#fff5f5", border: "#fecaca", label: "Cliente" },
};

const DEFAULT_CFG = { color: "#c40000", bg: "#fff5f5", border: "#fecaca", label: "Usuario" };

/* ── Links por rol ───────────────────────────────────────────── */
const getLinks = (isAdmin, isOperador, isCliente) => {
  const base = [{ to: "/", label: "Inicio", icon: "" },
    { to: "/repuestos", label: "Repuestos", icon: "" }];

  if (isCliente) return [
    ...base,
    { to: "/pedido/nuevo", label: "Carrito",     icon: "" },
    { to: "/mis-pedidos",  label: "Mis pedidos", icon: "" },
  ];

  if (isAdmin) return [
    ...base,
    { to: "/admin",           label: "Dashboard",  icon: "" },
    { to: "/admin/pedidos",   label: "Pedidos",    icon: "" },
    { to: "/admin/usuarios",  label: "Usuarios",   icon: "" },
    { to: "/admin/analytics", label: "Analytics",  icon: "" },
    { to: "/pedido/nuevo",    label: "Carrito",    icon: "" },
  ];

  if (isOperador) return [
    ...base,
    { to: "/operador",            label: "Panel",     icon: "" },
    { to: "/operador/pedidos",    label: "Pedidos",   icon: "" },
    { to: "/operador/analytics",  label: "Analytics", icon: "" },
    { to: "/pedido/nuevo",        label: "Carrito",   icon: "" },
  ];

  return base;
};

/* ── Initials avatar ─────────────────────────────────────────── */
function Avatar({ nombre, color, bg, border }) {
  const initials = (nombre || "U")
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();
  return (
    <div style={{
      width: 34, height: 34, borderRadius: "50%",
      background: bg, border: `2px solid ${border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 800, color, flexShrink: 0,
      letterSpacing: "0.03em",
    }}>
      {initials}
    </div>
  );
}

/* ── Dropdown menú usuario ───────────────────────────────────── */
function UserDropdown({ user, cfg, logout, open, setOpen, dropRef }) {
  return (
    <div ref={dropRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "transparent", border: "1px solid #2a2a2a",
          borderRadius: 40, padding: "4px 12px 4px 4px", cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
          ...(open ? { borderColor: "#3a3a3a", background: "#1a1a1a" } : {}),
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#3a3a3a"; e.currentTarget.style.background = "#1a1a1a"; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.background = "transparent"; } }}
      >
        <Avatar nombre={user.nombre} color={cfg.color} bg={cfg.bg} border={cfg.border} />
        <div style={{ textAlign: "left" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.2, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.nombre}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: cfg.color, fontWeight: 700 }}>{cfg.label}</p>
        </div>
        <span style={{ color: "#555", fontSize: 11, marginLeft: 2, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14,
          padding: 8, minWidth: 200,
          boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          animation: "dropIn 0.18s cubic-bezier(0.34,1.56,0.64,1)",
          zIndex: 200,
        }}>
          {/* User info */}
          <div style={{ padding: "10px 14px 12px", borderBottom: "1px solid #222" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#fff" }}>{user.nombre}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#555" }}>{user.email || "Sin correo"}</p>
            <span style={{ display: "inline-block", marginTop: 6, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
              {cfg.label}
            </span>
          </div>
          {/* Actions */}
          <div style={{ padding: "6px 0 0" }}>
            <button
              onClick={() => { logout(); setOpen(false); }}
              style={{
                width: "100%", padding: "9px 14px", background: "transparent",
                border: "none", color: "#ef4444", fontFamily: "inherit", fontSize: 13,
                fontWeight: 600, cursor: "pointer", textAlign: "left", borderRadius: 8,
                display: "flex", alignItems: "center", gap: 8, transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#2a0a0a"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 15 }}>→</span> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Mobile menu ─────────────────────────────────────────────── */
function MobileMenu({ links, location, accentColor, open }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", top: 57, left: 0, right: 0, zIndex: 99,
      background: "#111", borderBottom: "1px solid #222",
      padding: "12px 16px 16px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      animation: "slideDown 0.2s ease",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      {links.map(l => {
        const active = location.pathname.startsWith(l.to);
        return (
          <Link key={l.to} to={l.to} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "11px 14px", borderRadius: 10, textDecoration: "none",
            background: active ? "#1a1a1a" : "transparent",
            color: active ? accentColor : "#bbb",
            fontWeight: active ? 700 : 500, fontSize: 14,
            borderLeft: `3px solid ${active ? accentColor : "transparent"}`,
            transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 16 }}>{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}

/* ── Main Navbar ─────────────────────────────────────────────── */
export default function Navbar() {
  const { user, loggedIn, logout, isAdmin, isOperador, isCliente } = useAuth();
  const loc      = useLocation();
  const [dropOpen,   setDropOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  const cfg         = user ? (ROL_CFG[user.rol] || DEFAULT_CFG) : DEFAULT_CFG;
  const accentColor = cfg.color;
  const links       = loggedIn ? getLinks(isAdmin, isOperador, isCliente) : [{ to: "/repuestos", label: "Repuestos", icon: "🔧" }];

  // Cerrar dropdown al click fuera
  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cerrar mobile al cambiar ruta
  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [loc.pathname]);

  return (
    <>
      <style>{`
        @keyframes dropIn   { from { opacity:0; transform:translateY(-8px) scale(0.97) } to { opacity:1; transform:none } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:none } }
        .nav-link:hover { background: #1a1a1a !important; color: #fff !important; }
        .hamburger:hover { background: #1a1a1a !important; }
      `}</style>

      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 24px", height: 57,
        background: "#111",
        borderBottom: "1px solid #1e1e1e",
        boxShadow: "0 1px 0 #1e1e1e",
        position: "sticky", top: 0, zIndex: 100, gap: 16,
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: accentColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 900, color: "#fff",
          }}>N</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
            Nissan <span style={{ color: accentColor }}>Parts</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: 2, alignItems: "center", flex: 1, justifyContent: "center", flexWrap: "nowrap", overflow: "hidden" }}>
          {links.map(l => {
            const active = loc.pathname === l.to || (l.to !== "/" && loc.pathname.startsWith(l.to));
            return (
              <Link
                key={l.to}
                to={l.to}
                className="nav-link"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 8, textDecoration: "none",
                  color: active ? "#fff" : "#888",
                  fontWeight: active ? 700 : 500, fontSize: 13,
                  background: active ? "#1a1a1a" : "transparent",
                  borderBottom: active ? `2px solid ${accentColor}` : "2px solid transparent",
                  transition: "all 0.15s", whiteSpace: "nowrap",
                  // Ocultar en mobile
                  display: "flex",
                }}
              >
                <span style={{ fontSize: 14 }}>{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right section */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {!loggedIn ? (
            <Link to="/login" style={{
              background: accentColor, color: "#fff", textDecoration: "none",
              padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
              boxShadow: `0 4px 12px ${accentColor}44`, transition: "all 0.2s",
            }}>
              Iniciar sesión
            </Link>
          ) : (
            <UserDropdown
              user={user}
              cfg={cfg}
              logout={logout}
              open={dropOpen}
              setOpen={setDropOpen}
              dropRef={dropRef}
            />
          )}

          {/* Hamburger (mobile) */}
          <button
            className="hamburger"
            onClick={() => setMobileOpen(o => !o)}
            style={{
              display: "none", // se muestra solo en mobile vía media query inline workaround
              width: 36, height: 36, borderRadius: 8,
              background: "transparent", border: "1px solid #2a2a2a",
              cursor: "pointer", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 5, padding: 0, transition: "background 0.15s",
              // visible en pantallas pequeñas
              "@media (max-width: 640px)": { display: "flex" },
            }}
            aria-label="Menú"
          >
            <span style={{ display: "block", width: 16, height: 2, background: mobileOpen ? "#ef4444" : "#888", borderRadius: 2, transition: "all 0.2s", transform: mobileOpen ? "rotate(45deg) translate(3px, 3px)" : "none" }} />
            <span style={{ display: "block", width: 16, height: 2, background: mobileOpen ? "transparent" : "#888", borderRadius: 2, transition: "all 0.2s" }} />
            <span style={{ display: "block", width: 16, height: 2, background: mobileOpen ? "#ef4444" : "#888", borderRadius: 2, transition: "all 0.2s", transform: mobileOpen ? "rotate(-45deg) translate(3px, -3px)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <MobileMenu links={links} location={loc} accentColor={accentColor} open={mobileOpen} />
    </>
  );
}