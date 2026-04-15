import { useCart } from "../store/cart";
import { crearPedido } from "../services/api";

export default function CrearPedido() {
  const items = useCart(state => state.items);
  const clear = useCart(state => state.clear);

  const enviar = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Debes iniciar sesión para hacer un pedido");
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Sesión inválida");
      return;
    }

    if (items.length === 0) {
      alert("Carrito vacío");
      return;
    }

    try {
      const res = await crearPedido({
        id_cliente: user.id,
        id_usuario: user.id,
        detalles: items,
      });

      alert("Pedido creado #" + res.idPedido);
      clear();

    } catch (error) {
      console.error(error);
      alert(error.message || "Error al crear pedido");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Carrito 🛒</h2>

      {items.map((item, i) => (
        <div key={i}>
          Repuesto: {item.id_repuesto} | Cantidad: {item.cantidad}
        </div>
      ))}

      <button onClick={enviar}>
        Confirmar pedido
      </button>
    </div>
  );
}