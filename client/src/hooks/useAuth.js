// client/src/hooks/useAuth.js
// RF2 FIX: Context real con useState y useEffect para reactividad
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  // Escucha cambios en localStorage desde otras pestañas
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user") {
        try { setUser(JSON.parse(e.newValue || "null")); }
        catch { setUser(null); }
      }
      if (e.key === "token") {
        setToken(e.newValue || null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = (userData, tokenData) => {
    localStorage.setItem("user",  JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
    setUser(userData);
    setToken(tokenData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    window.location.href = "/login";
  };

  const loggedIn   = !!token && !!user;
  const isAdmin    = user?.rol === "ADMINISTRADOR";
  const isOperador = user?.rol === "OPERADOR" || isAdmin;
  const isCliente  = user?.rol === "CLIENTE";

  return (
    <AuthContext.Provider value={{ user, token, loggedIn, isAdmin, isOperador, isCliente, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}