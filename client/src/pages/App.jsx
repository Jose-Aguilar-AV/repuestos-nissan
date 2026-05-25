import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Repuestos from "./pages/Repuestos";
import CrearPedido from "./pages/CrearPedido";
import Pedidos from "./pages/Pedidos";
import DetalleProducto from "./pages/DetalleProducto";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/repuestos" element={<Repuestos />} />
        <Route path="/pedido/nuevo" element={<CrearPedido />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/repuesto/:id" element={<DetalleProducto />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;