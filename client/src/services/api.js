const API = "http://localhost:3000/api";

// 🔧 helper para manejar errores correctamente
const handleResponse = async (res) => {
  const text = await res.text();

  try {
    const json = JSON.parse(text);

    if (!res.ok) {
      throw new Error(json.error || "Error en la petición");
    }

    return json;
  } catch {
    throw new Error("Respuesta inválida del servidor");
  }
};

// =============================
// 🔹 REPUESTOS
// =============================

export const getRepuestos = () =>
  fetch(`${API}/repuestos`).then(handleResponse);

export const getRepuesto = (id) =>
  fetch(`${API}/repuestos/${id}`).then(handleResponse);


// =============================
// 🔹 PEDIDOS
// =============================

// 🧾 Crear pedido
export const crearPedido = (data) =>
  fetch(`${API}/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handleResponse);


// 📋 Obtener pedidos por usuario
export const getPedidos = (id_usuario) =>
  fetch(`${API}/pedidos/usuario/${id_usuario}`)
    .then(handleResponse);


// 🔍 Obtener detalle de pedido
export const getPedido = (id) =>
  fetch(`${API}/pedidos/${id}`)
    .then(handleResponse);


// ✏️ Actualizar pedido
export const actualizarPedido = (id, data) =>
  fetch(`${API}/pedidos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handleResponse);


// ❌ Cancelar pedido
export const cancelarPedido = (id) =>
  fetch(`${API}/pedidos/${id}/cancelar`, {
    method: "PUT",
  }).then(handleResponse);