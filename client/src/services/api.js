const API = "http://localhost:3000/api";

export const getRepuestos = () =>
  fetch(`${API}/repuestos`).then(r => r.json());

export const getRepuesto = (id) =>
  fetch(`${API}/repuestos/${id}`).then(r => r.json());

export const getStock = (id) =>
  fetch(`${API}/repuestos/${id}/stock`).then(r => r.json());

export const crearPedido = (data) =>
  fetch(`${API}/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const getPedidos = () =>
  fetch(`${API}/pedidos`).then(r => r.json());