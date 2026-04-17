import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Repuestos from "./pages/Repuestos";
import CrearPedido from "./pages/CrearPedido";
import Pedidos from "./pages/Pedidos";
import Login from "./pages/login";
import PedidoDetalle from "./pages/PedidoDetalle";


function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Home />} />
        <Route path="/repuestos" element={<Repuestos />} />

        <Route
          path="/pedido/nuevo"
          element={
            <ProtectedRoute>
              <CrearPedido />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pedidos"
          element={
            <ProtectedRoute>
              <Pedidos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pedido/:id"
          element={
            <ProtectedRoute>
              <PedidoDetalle />
            </ProtectedRoute>
          }
        />

      </Routes>
    </>
  );
}

export default App;