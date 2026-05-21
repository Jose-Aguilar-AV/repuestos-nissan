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

  const [guardando, setGuardando] = useState(false);

  const [cambiosSinGuardar, setCambiosSinGuardar] =
    useState(false);

  useEffect(() => {

    cargarPedido();

  }, [id]);

  const cargarPedido = async () => {

    try {

      const data = await getPedido(id);

      const agrupados = [];

      data.forEach(d => {

        const existe = agrupados.find(
          x => x.id_repuesto === d.id_repuesto
        );

        if (existe) {

          existe.cantidad += d.cantidad;

        } else {

          agrupados.push({
            id_repuesto: d.id_repuesto,
            nombre: d.nombre,
            descripcion: d.descripcion,
            cantidad: d.cantidad || 1,
          });

        }

      });

      setItems(agrupados);

    } catch (error) {

      console.error(error);

      alert("Error cargando pedido");

    } finally {

      setLoading(false);

    }
  };

  const cambiarCantidad = (index, valor) => {

    const cantidad = Number(valor);

    if (cantidad < 1) return;

    const copia = [...items];

    copia[index].cantidad = cantidad;

    setItems(copia);

    setCambiosSinGuardar(true);
  };

  const guardar = async () => {

    try {

      setGuardando(true);

      await actualizarPedido(id, {
        detalles: items,
      });

      alert("Pedido actualizado");

      setCambiosSinGuardar(false);

      navigate("/pedidos");

    } catch (err) {

      console.error(err);

      alert("Error al actualizar");

    } finally {

      setGuardando(false);

    }
  };

  const cancelar = async () => {

    const confirmar = window.confirm(
      "¿Seguro que deseas cancelar este pedido?"
    );

    if (!confirmar) return;

    try {

      await cancelarPedido(id);

      alert("Pedido cancelado");

      navigate("/pedidos");

    } catch (err) {

      console.error(err);

      alert("Error al cancelar");

    }
  };

  const volver = () => {

    if (cambiosSinGuardar) {

      const confirmar = window.confirm(
        "Tienes cambios sin guardar.\n\n¿Deseas salir igualmente?"
      );

      if (!confirmar) return;
    }

    navigate("/pedidos");
  };

  if (loading) {

    return (
      <p style={{ padding: 20 }}>
        Cargando...
      </p>
    );
  }

  return (

    <div style={container}>

      <div style={header}>

        <h1 style={title}>
          Detalle del pedido #{id}
        </h1>

        <button
          style={btnVolver}
          onClick={volver}
        >
          Volver
        </button>

      </div>

      {items.map((item, i) => (

        <div
          key={item.id_repuesto}
          style={card}
        >

          <div style={icon}>
            🔧
          </div>

          <div style={info}>

            <h3 style={nombre}>
              {item.nombre}
            </h3>

            <p style={desc}>
              {item.descripcion}
            </p>

            <div style={row}>

              <label>
                Cantidad:
              </label>

              <input
                type="number"
                value={item.cantidad}
                min={1}
                onChange={(e) =>
                  cambiarCantidad(
                    i,
                    e.target.value
                  )
                }
                style={input}
              />

            </div>

          </div>

        </div>

      ))}

      <div style={actions}>

        <button
          style={{
            ...btnGuardar,
            opacity: guardando ? 0.7 : 1,
          }}
          disabled={guardando}
          onClick={guardar}
        >
          {guardando
            ? "Guardando..."
            : "Guardar cambios"}
        </button>

        <button
          style={btnCancelar}
          onClick={cancelar}
        >
          Cancelar pedido
        </button>

      </div>

    </div>
  );
}

/* ESTILOS */

const container = {
  padding: 30,
  maxWidth: 850,
  margin: "auto",
  fontFamily: "sans-serif",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 25,
  gap: 20,
  flexWrap: "wrap",
};

const title = {
  color: "#c40000",
  margin: 0,
};

const btnVolver = {
  background: "#eee",
  border: "none",
  padding: "10px 18px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: "bold",
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  marginBottom: 18,
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  display: "flex",
  gap: 18,
  alignItems: "center",
};

const icon = {
  width: 70,
  height: 70,
  borderRadius: 14,
  background: "#ffe5e5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 30,
};

const info = {
  flex: 1,
};

const nombre = {
  margin: 0,
  marginBottom: 8,
};

const desc = {
  color: "#666",
  marginBottom: 15,
};

const row = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const input = {
  width: 90,
  padding: 8,
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 16,
};

const actions = {
  display: "flex",
  gap: 14,
  marginTop: 30,
};

const btnGuardar = {
  flex: 1,
  padding: 14,
  background: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 16,
};

const btnCancelar = {
  flex: 1,
  padding: 14,
  background: "#c40000",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 16,
};