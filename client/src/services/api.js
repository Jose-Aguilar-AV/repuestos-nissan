const API = import.meta.env.VITE_API_URL || "/api";

// ── Helper base ───────────────────────────────────────────────────────────────
async function req(url, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { error: text }; }

  if (!res.ok) {
    const msg = data?.error || data?.mensaje || `Error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

const get   = (url, params) => req(url + (params && Object.keys(params).length ? "?" + new URLSearchParams(params) : ""));
const post  = (url, body)   => req(url, { method: "POST",  body: JSON.stringify(body) });
const put   = (url, body)   => req(url, { method: "PUT",   body: JSON.stringify(body) });
const patch = (url, body)   => req(url, { method: "PATCH", body: JSON.stringify(body) });

// ═════════════════════════════════════════════════════════════════════════════
//  AUTH
// ═════════════════════════════════════════════════════════════════════════════
export const login    = (correo, password) => post("/login",    { correo, password });
export const register = (data)             => post("/register", data);

// ═════════════════════════════════════════════════════════════════════════════
//  REPUESTOS
// ═════════════════════════════════════════════════════════════════════════════
export const getRepuestos   = ()         => get("/repuestos");
export const getRepuesto    = (id)       => get(`/repuestos/${id}`);
export const getStock       = (id)       => get(`/repuestos/${id}`);
export const createRepuesto = (data)     => post("/repuestos", data);
export const updateRepuesto = (id, data) => put(`/repuestos/${id}`, data);
export const ajustarStock   = (id, delta) => patch(`/repuestos/${id}/stock`, { delta });
export const editarRepuesto = (id, data) => put(`/repuestos/${id}`, data);

// ═════════════════════════════════════════════════════════════════════════════
//  CLIENTES
// ═════════════════════════════════════════════════════════════════════════════
export const getClientes  = (q)    => get("/clientes", q ? { q } : {});
export const crearCliente = (data) => post("/clientes", data);

// ═════════════════════════════════════════════════════════════════════════════
//  PEDIDOS
// ═════════════════════════════════════════════════════════════════════════════
export const getPedidos       = (filtros = {}) => get("/pedidos", filtros);
export const getMisPedidos    = ()             => get("/mis-pedidos");
export const getPedido        = (id)           => get(`/pedidos/${id}`);
export const actualizarPedido = (id, data)     => put(`/pedidos/${id}`, data);
export const crearPedido      = (data)         => post("/pedidos", data);
export const editarPedido     = (id, data)     => put(`/pedidos/${id}`, data);
export const cancelarPedido   = (id)           => put(`/pedidos/${id}/cancelar`);
export const cambiarEstado    = (id, id_estado) => put(`/pedidos/${id}/estado`, { id_estado });

// ═════════════════════════════════════════════════════════════════════════════
//  HISTORIAL
// ═════════════════════════════════════════════════════════════════════════════
export const getHistorialPedido = (id) => get(`/pedidos/${id}/historial`);
// alias por compatibilidad
export const getHistorial = getHistorialPedido;

// ═════════════════════════════════════════════════════════════════════════════
//  ESTADOS
// ═════════════════════════════════════════════════════════════════════════════
export const getEstados = () => get("/estados");

// ═════════════════════════════════════════════════════════════════════════════
//  USUARIOS  (solo admin)
// ═════════════════════════════════════════════════════════════════════════════
export const getUsuarios         = ()           => get("/usuarios");
export const crearUsuario        = (data)       => post("/usuarios", data);
export const toggleEstadoUsuario = (id, estado) => patch(`/usuarios/${id}/estado`, { estado });
export const cambiarRolUsuario   = (id, rol)    => patch(`/usuarios/${id}/rol`, { rol });

// ═════════════════════════════════════════════════════════════════════════════
//  ANALYTICS
// FIX: todas las funciones aceptan filtros opcionales { fecha_desde, fecha_hasta }
// ═════════════════════════════════════════════════════════════════════════════
export const getResumen          = (filtros = {}) => get("/analytics/resumen",       filtros);
export const getTopRepuestos     = (filtros = {}) => get("/analytics/top-repuestos", filtros);
export const getPedidosPorDia    = (filtros = {}) => get("/analytics/pedidos-por-dia", filtros);
export const getTopClientes      = ()             => get("/analytics/top-clientes");
export const getStockAnalytics   = ()             => get("/analytics/stock");
export const getEstadosAnalytics = ()             => get("/analytics/estados");

