import { useEffect, useState } from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  getPedido,
  actualizarPedido,
  cancelarPedido,
  getHistorialPedido,
} from "../services/api";

export default function PedidoDetalle() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [items, setItems] =
    useState([]);

  const [estado, setEstado] =
    useState(1);

  const [fecha, setFecha] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [
    cambiosSinGuardar,
    setCambiosSinGuardar,
  ] = useState(false);

  const [historial, setHistorial] =
    useState([]);

  const [
    mostrarHistorial,
    setMostrarHistorial,
  ] = useState(false);

  useEffect(() => {

    cargarPedido();

  }, [id]);

  const cargarPedido = async () => {

    try {

      const data =
        await getPedido(id);

      if (data.length > 0) {

        setEstado(
          data[0].id_estado
        );

        setFecha(
          data[0].fecha_creacion
        );

      }

      const agrupados = [];

      data.forEach(d => {

        const existe =
          agrupados.find(
            x =>
              x.id_repuesto ===
              d.id_repuesto
          );

        if (existe) {

          existe.cantidad +=
            d.cantidad;

        } else {

          agrupados.push({

            id_repuesto:
              d.id_repuesto,

            nombre:
              d.nombre,

            descripcion:
              d.descripcion,

            cantidad:
              d.cantidad || 1,

          });

        }

      });

      setItems(agrupados);

      // HISTORIAL

      const historialData =
        await getHistorialPedido(id);

      setHistorial(
        historialData || []
      );      

    } catch (error) {

      console.error(error);

      alert(
        "Error cargando pedido"
      );

    } finally {

      setLoading(false);

    }

  };

  const cambiarCantidad = (
    index,
    valor
  ) => {

    const cantidad =
      Number(valor);

    if (cantidad < 1)
      return;

    const copia = [...items];

    copia[index].cantidad =
      cantidad;

    setItems(copia);

    setCambiosSinGuardar(
      true
    );

  };

  const guardar = async () => {

    try {

      setGuardando(true);

      await actualizarPedido(
        id,
        {
          detalles: items,
        }
      );

      alert(
        "Pedido actualizado"
      );

      setCambiosSinGuardar(
        false
      );

      navigate("/pedidos");

    } catch (err) {

      console.error(err);

      alert(
        "Error al actualizar"
      );

    } finally {

      setGuardando(false);

    }

  };

  const cancelar = async () => {

    const confirmar =
      window.confirm(
        "¿Seguro que deseas cancelar este pedido?"
      );

    if (!confirmar)
      return;

    try {

      await cancelarPedido(id);

      alert(
        "Pedido cancelado"
      );

      navigate("/pedidos");

    } catch (err) {

      console.error(err);

      alert(
        "Error al cancelar"
      );

    }

  };

  const volver = () => {

    if (
      cambiosSinGuardar
    ) {

      const confirmar =
        window.confirm(
          "Tienes cambios sin guardar.\n\n¿Deseas salir igualmente?"
        );

      if (!confirmar)
        return;

    }

    navigate("/pedidos");

  };

  if (loading) {

    return (
      <p
        style={{
          padding: 20,
        }}
      >
        Cargando...
      </p>
    );

  }

  const estados = {

    1: "PENDIENTE",

    2: "EN PROCESO",

    3: "FINALIZADO",

    4: "CANCELADO",

  };

  return (

    <div style={container}>

      {/* HEADER */}

      <div style={header}>

        <div>

          <h1 style={title}>
            Pedido #{id}
          </h1>

          <p style={fechaText}>
            {new Date(
              fecha
            ).toLocaleString()}
          </p>

        </div>

        <button
          style={btnVolver}
          onClick={volver}
        >
          Volver
        </button>

      </div>

      {/* ESTADO */}

      <div
        style={
          progressContainer
        }
      >

        <div
          style={
            progressLabels
          }
        >

          <span
            style={{
              ...stepLabel,
              color:
                estado >= 1
                  ? "#c40000"
                  : "#999",
            }}
          >
            Pendiente
          </span>

          <span
            style={{
              ...stepLabel,
              color:
                estado >= 2
                  ? "#c40000"
                  : "#999",
            }}
          >
            En proceso
          </span>

          <span
            style={{
              ...stepLabel,
              color:
                estado >= 3
                  ? "#28a745"
                  : "#999",
            }}
          >
            Finalizado
          </span>

        </div>

        <div
          style={
            barBackground
          }
        >

          <div
            style={{

              ...barProgress,

              width:
                estado === 1
                  ? "20%"
                  : estado === 2
                  ? "60%"
                  : "100%",

              background:
                estado === 4
                  ? "#c40000"
                  : "linear-gradient(90deg, #c40000, #28a745)",

            }}
          />

        </div>

        <p style={estadoText}>

          Estado actual:{" "}

          <span
            style={
              estadoStyle
            }
          >
            {
              estados[
                estado
              ]
            }
          </span>

        </p>

        {estado === 4 && (

          <p
            style={
              canceladoText
            }
          >
            Pedido cancelado
          </p>

        )}

        {/* BOTON HISTORIAL */}

        <button
          style={
            btnHistorial
          }
          onClick={() =>
            setMostrarHistorial(
              !mostrarHistorial
            )
          }
        >

          {mostrarHistorial
            ? "Ocultar historial"
            : "Ver historial"}

        </button>

        {/* TIMELINE */}

        {mostrarHistorial && (

          <div
            style={timeline}
          >

            {historial.length === 0 ? (

              <p style={{ color: "#666" }}>
                No hay historial disponible
              </p>

            ) : historial.map(            
              (h) => (

              <div
                key={
                  h.id_historial
                }
                style={
                  timelineItem
                }
              >

                <div
                  style={
                    timelineDot
                  }
                />

                <div
                  style={
                    timelineContent
                  }
                >

                  <p
                    style={
                      timelineEstado
                    }
                  >

                    {h.estado_anterior
                      ? `${h.estado_anterior} → ${h.estado_nuevo}`
                      : `Creado en ${h.estado_nuevo}`}

                  </p>

                  <p
                    style={
                      timelineFecha
                    }
                  >

                    {new Date(
                      h.fecha_cambio
                    ).toLocaleString()}

                  </p>

                  <p
                    style={
                      timelineUsuario
                    }
                  >
                    Por: {h.usuario}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* PRODUCTOS */}

      {items.map(
        (item, i) => (

        <div
          key={
            item.id_repuesto
          }
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
                value={
                  item.cantidad
                }
                min={1}
                onChange={(e) =>
                  cambiarCantidad(
                    i,
                    e.target.value
                  )
                }
                style={input}
                disabled={
                  estado === 3 ||
                  estado === 4
                }
              />

            </div>

          </div>

        </div>

      ))}

      {/* BOTONES */}

      {estado !== 4 &&
        estado !== 3 && (

        <div style={actions}>

          <button
            style={{
              ...btnGuardar,
              opacity:
                guardando
                  ? 0.7
                  : 1,
            }}
            disabled={
              guardando
            }
            onClick={guardar}
          >

            {guardando
              ? "Guardando..."
              : "Guardar cambios"}

          </button>

          <button
            style={
              btnCancelar
            }
            onClick={
              cancelar
            }
          >
            Cancelar pedido
          </button>

        </div>

      )}

    </div>

  );

}

/* ESTILOS */

const container = {
  padding: 30,
  maxWidth: 850,
  margin: "auto",
  fontFamily:
    "sans-serif",
};

const header = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  marginBottom: 25,
  gap: 20,
  flexWrap: "wrap",
};

const title = {
  color: "#c40000",
  margin: 0,
};

const fechaText = {
  color: "#666",
  marginTop: 6,
};

const btnVolver = {
  background: "#eee",
  border: "none",
  padding: "10px 18px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: "bold",
};

const progressContainer = {
  marginBottom: 30,
};

const progressLabels = {
  display: "flex",
  justifyContent:
    "space-between",
  marginBottom: 10,
};

const stepLabel = {
  fontWeight: "bold",
  fontSize: 14,
};

const barBackground = {
  width: "100%",
  height: 14,
  background: "#eee",
  borderRadius: 20,
  overflow: "hidden",
};

const barProgress = {
  height: "100%",
  borderRadius: 20,
  transition:
    "all 0.4s ease",
};

const estadoText = {
  marginTop: 10,
  color: "#444",
};

const estadoStyle = {
  background: "#ffe5e5",
  color: "#c40000",
  padding: "6px 12px",
  borderRadius: 20,
  fontWeight: "bold",
  fontSize: 14,
};

const canceladoText = {
  color: "#c40000",
  fontWeight: "bold",
  marginTop: 10,
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  marginBottom: 18,
  boxShadow:
    "0 4px 14px rgba(0,0,0,0.08)",
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
  justifyContent:
    "center",
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
  border:
    "1px solid #ccc",
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

const btnHistorial = {
  marginTop: 20,
  padding: "10px 16px",
  border: "none",
  borderRadius: 10,
  background: "#222",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
};

const timeline = {
  marginTop: 25,
  borderLeft:
    "3px solid #ddd",
  paddingLeft: 20,
};

const timelineItem = {
  position: "relative",
  marginBottom: 25,
};

const timelineDot = {
  width: 14,
  height: 14,
  borderRadius: "50%",
  background: "#c40000",
  position: "absolute",
  left: -28,
  top: 5,
};

const timelineContent = {
  background: "#fff",
  padding: 14,
  borderRadius: 12,
  boxShadow:
    "0 2px 10px rgba(0,0,0,0.08)",
};

const timelineEstado = {
  fontWeight: "bold",
  marginBottom: 6,
};

const timelineFecha = {
  color: "#666",
  fontSize: 14,
  marginBottom: 4,
};

const timelineUsuario = {
  fontSize: 14,
  color: "#999",
};