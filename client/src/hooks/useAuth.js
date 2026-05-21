// ─────────────────────────────────────────────────────────────────────────────
// hooks/useAuth.js  ─  Hook centralizado de autenticación
// ─────────────────────────────────────────────────────────────────────────────

export function useAuth() {
  const user  = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const isAdmin    = user?.rol === "ADMINISTRADOR";
  const isOperador = user?.rol === "OPERADOR" || isAdmin;
  const isCliente  = user?.rol === "CLIENTE";
  const loggedIn   = !!token && !!user;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return { user, token, isAdmin, isOperador, isCliente, loggedIn, logout };
}