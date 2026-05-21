import { useState } from "react";
import { useCart } from "../store/cart";
import { crearPedido } from "../services/api";

export default function CrearPedido() {

  const items =
    useCart(state => state.items);

  const add =
    useCart(state => state.add);

  const decrease =
    useCart(state => state.decrease);

  const remove =
    useCart(state => state.remove);

  const clear =
    useCart(state => state.clear);

  const [modal, setModal] =
    useState(null);

  const [cantidadEliminar, setCantidadEliminar] =
    useState(1);

  const enviar = async () => {

    const token =
      localStorage.getItem("token");

    if (!token) {

      alert(
        "Debes iniciar sesión"
      );

      window.location.href = "/login";

      return;
    }

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (!user) {

      alert("Sesión inválida");

      return;
    }

    if (items.length === 0) {

      alert("Carrito vacío");

      return;
    }

    const invalido = items.find(
      item => item.cantidad > item.stock
    );

    if (invalido) {

      alert(
        `No hay suficiente stock para ${invalido.nombre}`
      );

      return;
    }

    try {

      const res = await crearPedido({

        id_cliente: user.id_cliente,

        id_usuario: user.id,

        detalles: items.map(item => ({
          id_repuesto: item.id_repuesto,
          cantidad: item.cantidad,
        })),

      });

      alert(
        "Pedido creado #" +
        res.idPedido
      );

      clear();

    } catch (error) {

      console.error(error);

      alert(
        error.message ||
        "Error al crear pedido"
      );
    }
  };

  return (

    <div style={container}>

      <h1 style={title}>
        Tu Carrito
      </h1>

      {items.length === 0 ? (

        <p style={empty}>
          Tu carrito está vacío
        </p>

      ) : (

        <>

          <div style={list}>

            {items.map(item => (

              <div
                key={item.id_repuesto}
                style={card}
              >

                <div style={image}>
                  🔧
                </div>

                <div style={info}>

                  <h3 style={name}>
                    {item.nombre}
                  </h3>

                  <p style={stock}>
                    Stock disponible:{" "}
                    <b>
                      {item.stock}
                    </b>
                  </p>

                  <div style={cantidadBox}>

                    <button
                      style={qtyBtn}
                      onClick={() =>
                        decrease(
                          item.id_repuesto
                        )
                      }
                    >
                      -
                    </button>

                    <span style={cantidad}>
                      {item.cantidad}
                    </span>

                    <button
                      style={qtyBtn}
                      onClick={() => {

                        if (
                          item.cantidad >=
                          item.stock
                        ) {

                          alert(
                            `No hay más stock de ${item.nombre}`
                          );

                          return;
                        }

                        add({
                          ...item,
                          cantidad: 1,
                        });

                      }}
                    >
                      +
                    </button>

                  </div>

                </div>

                <button
                  style={deleteBtn}
                  onClick={() => {

                    setModal(item);

                    setCantidadEliminar(1);

                  }}
                >
                  ✕
                </button>

              </div>

            ))}

          </div>

          <div style={actions}>

            <button
              style={clearBtn}
              onClick={clear}
            >
              Vaciar carrito
            </button>

            <button
              style={btn}
              onClick={enviar}
            >
              Confirmar pedido
            </button>

          </div>

        </>

      )}

      {modal && (

        <div style={overlay}>

          <div style={modalBox}>

            <h3>
              Eliminar productos
            </h3>

            <p>
              Hay {modal.cantidad} unidades
            </p>

            <input
              type="number"
              min="1"
              max={modal.cantidad}
              value={cantidadEliminar}
              onChange={(e) =>
                setCantidadEliminar(
                  Number(e.target.value)
                )
              }
              style={input}
            />

            <div style={modalActions}>

              <button
                style={cancelBtn}
                onClick={() =>
                  setModal(null)
                }
              >
                Cancelar
              </button>

              <button
                style={confirmBtn}
                onClick={() => {

                  if (
                    cantidadEliminar <= 0
                  ) {
                    return;
                  }

                  if (
                    cantidadEliminar >=
                    modal.cantidad
                  ) {

                    remove(
                      modal.id_repuesto
                    );

                  } else {

                    for (
                      let i = 0;
                      i < cantidadEliminar;
                      i++
                    ) {

                      decrease(
                        modal.id_repuesto
                      );
                    }
                  }

                  setModal(null);

                }}
              >
                Eliminar
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

/* ESTILOS */

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
  fontSize: 20,
  marginBottom: 8,
};

const stock = {
  color: "#666",
  marginBottom: 12,
};

const cantidadBox = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const qtyBtn = {
  width: 35,
  height: 35,
  borderRadius: 8,
  border: "none",
  background: "#c40000",
  color: "#fff",
  cursor: "pointer",
  fontSize: 18,
};

const cantidad = {
  fontSize: 18,
  fontWeight: "bold",
};

const deleteBtn = {
  border: "none",
  background: "#ffebeb",
  color: "#c40000",
  width: 40,
  height: 40,
  borderRadius: 10,
  cursor: "pointer",
  fontSize: 18,
};

const actions = {
  display: "flex",
  gap: 15,
};

const clearBtn = {
  flex: 1,
  padding: 16,
  background: "#666",
  color: "#fff",
  border: "none",
  borderRadius: 14,
  cursor: "pointer",
  fontSize: 16,
};

const btn = {
  flex: 2,
  padding: 16,
  background:
    "linear-gradient(135deg, #c40000, #ff2a2a)",
  color: "#fff",
  border: "none",
  borderRadius: 14,
  fontSize: 18,
  fontWeight: "bold",
  cursor: "pointer",
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
};

const modalBox = {
  background: "#fff",
  padding: 30,
  borderRadius: 16,
  width: 320,
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ccc",
  marginTop: 10,
};

const modalActions = {
  display: "flex",
  gap: 10,
  marginTop: 20,
};

const cancelBtn = {
  flex: 1,
  padding: 12,
  border: "none",
  borderRadius: 10,
  background: "#999",
  color: "#fff",
  cursor: "pointer",
};

const confirmBtn = {
  flex: 1,
  padding: 12,
  border: "none",
  borderRadius: 10,
  background: "#c40000",
  color: "#fff",
  cursor: "pointer",
};