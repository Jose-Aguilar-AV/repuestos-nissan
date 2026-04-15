const API = "http://localhost:3000/api";

export const getRepuestos = () =>
  fetch(`${API}/repuestos`).then(r => r.json());

export const getRepuesto = (id) =>
  fetch(`${API}/repuestos/${id}`).then(r => r.json());



export const crearPedido = async (data) => {
  const res = await fetch(`${API}/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Error al crear pedido");
  }

  return json;
};

export const getPedidos = () =>
  fetch(`${API}/pedidos`).then(r => r.json());