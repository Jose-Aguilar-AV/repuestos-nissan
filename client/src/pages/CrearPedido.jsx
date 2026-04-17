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
        id_cliente: user.id_cliente,
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
    <div style={container}>
      <h1 style={title}>Tu Carrito</h1>

      {items.length === 0 ? (
        <p style={empty}>Tu carrito está vacío</p>
      ) : (
        <>
          <div style={list}>
            {items.map((item, i) => (
              <div key={i} style={card}>
                <div style={image}></div>

                <div style={info}>
                  <h3>Repuesto #{item.id_repuesto}</h3>
                  <p>Cantidad: {item.cantidad}</p>
                </div>
              </div>
            ))}
          </div>

          <button style={btn} onClick={enviar}>
             Confirmar pedido
          </button>
        </>
      )}
    </div>
  );
}

/* 🎨 ESTILOS */

const container = {
  padding: 30,
  maxWidth: 900,
  margin: "auto",
};

const title = {
  color: "#c40000",
  marginBottom: 20,
};

const empty = {
  textAlign: "center",
  fontSize: 18,
  color: "#777",
};

const list = {
  display: "flex",
  flexDirection: "column",
  gap: 15,
  marginBottom: 20,
};

const card = {
  display: "flex",
  gap: 15,
  padding: 15,
  borderRadius: 12,
  background: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  alignItems: "center",
};

const image = {
  width: 80,
  height: 80,
  background: "#eee",
  borderRadius: 10,
};

const info = {
  flex: 1,
};

const btn = {
  width: "100%",
  padding: 15,
  background: "#c40000",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontSize: 16,
  fontWeight: "bold",
  cursor: "pointer",
};