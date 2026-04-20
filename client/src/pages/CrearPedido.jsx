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
      <h1 style={title}>🛒 Tu Carrito</h1>

      {items.length === 0 ? (
        <p style={empty}>Tu carrito está vacío</p>
      ) : (
        <>
          <div style={list}>
            {items.map((item, i) => (
              <div key={i} style={card} className="card-hover">
                
                <div style={image}>
                  🔧
                </div>

                <div style={info}>
                  <h3 style={name}>Repuesto #{item.id_repuesto}</h3>
                  <div style={badge}>
                    {item.cantidad} unidades
                  </div>
                </div>

              </div>
            ))}
          </div>

          <button style={btn} onClick={enviar}>
            Confirmar pedido 🚀
          </button>
        </>
      )}
    </div>
  );
}

/* 🎨 ESTILOS */

const container = {
  padding: 40,
  maxWidth: 900,
  margin: "auto",
  fontFamily: "sans-serif",
};

const title = {
  color: "#c40000",
  marginBottom: 25,
  fontSize: 32,
  fontWeight: "bold",
};

const empty = {
  textAlign: "center",
  fontSize: 18,
  color: "#999",
  marginTop: 40,
};

const list = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
  marginBottom: 30,
};

const card = {
  display: "flex",
  gap: 20,
  padding: 18,
  borderRadius: 16,
  background: "#ffffff",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  alignItems: "center",
  transition: "all 0.25s ease",
};

const image = {
  width: 70,
  height: 70,
  background: "#ffe5e5",
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
};

const info = {
  flex: 1,
};

const name = {
  margin: 0,
  fontSize: 18,
  marginBottom: 8,
};

const badge = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: 20,
  background: "#c40000",
  color: "#fff",
  fontSize: 14,
};

const btn = {
  width: "100%",
  padding: 16,
  background: "linear-gradient(135deg, #c40000, #ff2a2a)",
  color: "#fff",
  border: "none",
  borderRadius: 14,
  fontSize: 18,
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s ease",
};