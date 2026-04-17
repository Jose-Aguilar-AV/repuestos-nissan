import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPedido,
  actualizarPedido,
  cancelarPedido,
} from "../services/api";

export default function PedidoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPedido(id).then((data) => {
      // 🔥 IMPORTANTE: asegurar valores definidos
      const formatted = data.map((d) => ({
        id_repuesto: d.id_repuesto,
        nombre: d.nombre,
        descripcion: d.descripcion,
        cantidad: d.cantidad || 1,
      }));

      setItems(formatted);
      setLoading(false);
    });
  }, [id]);

  // ✏️ Cambiar cantidad (FIX del error React)
  const cambiarCantidad = (index, valor) => {
    const copia = [...items];
    copia[index].cantidad = Number(valor) || 1;
    setItems(copia);
  };

  // 💾 Guardar cambios
  const guardar = async () => {
    try {
      await actualizarPedido(id, { detalles: items });
      alert("Pedido actualizado");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar");
    }
  };

  // ❌ Cancelar pedido
  const cancelar = async () => {
    if (!window.confirm("¿Seguro que quieres cancelar este pedido?")) return;

    try {
      await cancelarPedido(id);
      alert("Pedido cancelado");
      navigate("/pedidos");
    } catch (err) {
      console.error(err);
      alert("Error al cancelar");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Cargando...</p>;

  const handleCancelar = async () => {
    await cancelarPedido(id);
    
    alert("Pedido cancelado");
    
    // 🔥 recargar datos
    window.location.reload();
  };  

  return (
    <div style={container}>
      <h1 style={title}>Detalle del pedido #{id}</h1>

      {items.map((item, i) => (
        <div key={i} style={card}>
          <h3 style={nombre}>{item.nombre}</h3>
          <p style={desc}>{item.descripcion}</p>

          <div style={row}>
            <label>Cantidad:</label>
            <input
              type="number"
              value={item.cantidad ?? 1} // 🔥 FIX importante
              min={1}
              onChange={(e) =>
                cambiarCantidad(i, e.target.value)
              }
              style={input}
            />
          </div>
        </div>
      ))}

      <div style={actions}>
        <button style={btnGuardar} onClick={guardar}>
          Guardar cambios
        </button>

        <button style={btnCancelar} onClick={cancelar}>
          Cancelar pedido
        </button>
      </div>
    </div>
  );
}

/* 🎨 ESTILOS */

const container = {
  padding: 30,
  maxWidth: 800,
  margin: "auto",
};

const title = {
  marginBottom: 20,
  color: "#c40000",
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  marginBottom: 15,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
};

const nombre = {
  marginBottom: 5,
};

const desc = {
  color: "#666",
  marginBottom: 10,
};

const row = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const input = {
  width: 80,
  padding: 6,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const actions = {
  display: "flex",
  gap: 10,
  marginTop: 20,
};

const btnGuardar = {
  flex: 1,
  padding: 12,
  background: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const btnCancelar = {
  flex: 1,
  padding: 12,
  background: "#c40000",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};