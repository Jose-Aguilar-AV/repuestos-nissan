// ─────────────────────────────────────────────────────────────────────────────
// components/ProtectedRoute.jsx  ─  Protección de rutas por token y rol
// ─────────────────────────────────────────────────────────────────────────────
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Props:
 *   roles?: string[]  ─ si se pasa, solo esos roles pueden acceder
 *   children
 */
export default function ProtectedRoute({ children, roles }) {
  const { loggedIn, user } = useAuth();

  if (!loggedIn) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user?.rol)) {
    // Redirige al dashboard correcto según su rol
    if (user?.rol === "ADMINISTRADOR") return <Navigate to="/admin"      replace />;
    if (user?.rol === "OPERADOR")      return <Navigate to="/operador"   replace />;
    return                                          <Navigate to="/mis-pedidos" replace />;
  }

  return children;
}