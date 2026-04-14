import { useCart } from "../store/cart";
import { crearPedido } from "../services/api";

export default function CrearPedido() {
  const { items, clear } = useCart();

  const enviar = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Debes iniciar sesión");
        window.location.href = "/login";
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));

      if (!items || items.length === 0) {
        alert("El carrito está vacío");
        return;
      }

      const res = await crearPedido({
        id_cliente: 1,
        id_usuario: user.id,
        detalles: items,
      });

      alert("Pedido creado #" + res.idPedido);
      clear();
      window.location.href = "/pedidos";

    } catch (error) {
      console.error(error);
      alert("Error al crear el pedido");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🛒 Carrito</h2>

      {items.length === 0 && <p>No hay productos</p>}

      {items.map((i, idx) => (
        <div key={idx}>
          Repuesto #{i.id_repuesto} - Cantidad: {i.cantidad}
        </div>
      ))}

      {items.length > 0 && (
        <button onClick={enviar}>
          Confirmar Pedido
        </button>
      )}
    </div>
  );
}