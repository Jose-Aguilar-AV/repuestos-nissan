// client/src/App.jsx  ─  Rutas completas con protección por rol
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas públicas / cliente
import Home          from "./pages/Home";
import Repuestos     from "./pages/Repuestos";
import CrearPedido   from "./pages/CrearPedido";
import Pedidos       from "./pages/Pedidos";
import Login         from "./pages/login";
import PedidoDetalle from "./pages/PedidoDetalle";
import DetalleProducto from "./pages/DetalleProducto";

// Panel Operador
import OperadorDashboard  from "./pages/operador/OperadorDashboard";
import OperadorPedidos    from "./pages/operador/OperadorPedidos";
import OperadorCrearPedido from "./pages/operador/OperadorCrearPedido";
import OperadorAnalytics  from "./pages/operador/OperadorAnalytics";

// Panel Admin
import AdminDashboard  from "./pages/admin/AdminDashboard";
import AdminPedidos    from "./pages/admin/AdminPedidos";
import AdminUsuarios   from "./pages/admin/AdminUsuarios";
import AdminAnalytics  from "./pages/admin/AdminAnalytics";
import AdminRepuestos  from "./pages/admin/AdminRepuestos";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* ── Públicas ──────────────────────────────────────── */}
        <Route path="/login"     element={<Login />} />
        <Route path="/"          element={<Home />} />
        <Route path="/repuestos" element={<Repuestos />} />
        <Route path="/repuesto/:id" element={<DetalleProducto />} />

        {/* ── Cliente ───────────────────────────────────────── */}
        <Route path="/pedido/nuevo" element={
          <ProtectedRoute roles={["CLIENTE"]}>
            <CrearPedido />
          </ProtectedRoute>
        } />
        <Route path="/mis-pedidos" element={
          <ProtectedRoute roles={["CLIENTE"]}>
            <Pedidos />
          </ProtectedRoute>
        } />
        {/* alias legacy */}
        <Route path="/pedidos" element={
          <ProtectedRoute roles={["CLIENTE"]}>
            <Pedidos />
          </ProtectedRoute>
        } />
        <Route path="/pedido/:id" element={
          <ProtectedRoute>
            <PedidoDetalle />
          </ProtectedRoute>
        } />

        {/* ── Operador ──────────────────────────────────────── */}
        <Route path="/operador" element={
          <ProtectedRoute roles={["OPERADOR", "ADMINISTRADOR"]}>
            <OperadorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/operador/pedidos" element={
          <ProtectedRoute roles={["OPERADOR", "ADMINISTRADOR"]}>
            <OperadorPedidos />
          </ProtectedRoute>
        } />
        <Route path="/operador/pedidos/nuevo" element={
          <ProtectedRoute roles={["OPERADOR", "ADMINISTRADOR"]}>
            <OperadorCrearPedido />
          </ProtectedRoute>
        } />
        <Route path="/operador/analytics" element={
          <ProtectedRoute roles={["OPERADOR", "ADMINISTRADOR"]}>
            <OperadorAnalytics />
          </ProtectedRoute>
        } />

        {/* ── Admin ─────────────────────────────────────────── */}
        <Route path="/admin" element={
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/pedidos" element={
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <AdminPedidos />
          </ProtectedRoute>
        } />
        <Route path="/admin/usuarios" element={
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <AdminUsuarios />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <AdminAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/admin/repuestos" element={
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <AdminRepuestos />
          </ProtectedRoute>
        } />

        {/* ── Fallback ──────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;