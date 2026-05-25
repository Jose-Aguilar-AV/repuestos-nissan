// client/src/pages/Pedidos.jsx
// RF5 FIX: reemplaza getPedidos(user.id) por getMisPedidos()
// RF5 FIX: agrega loading state y manejo de errores
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMisPedidos } from "../services/api";

export default function Pedidos() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setError("");
      // RF5 FIX: getMisPedidos() usa el token del header — no pasa user.id
      const rows = await getMisPedidos();
      setData(rows || []);
    } catch (e) {
      setError(e.message || "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <h1 style={title}>Mis pedidos</h1>

      {loading && <p style={{ color: "#64748b", textAlign: "center" }}>Cargando...</p>}
      {error   && <p style={{ color: "#ef4444", textAlign: "center" }}>{error}</p>}

      {!loading && !error && data.length === 0 && (
        <p style={empty}>No tienes pedidos aún</p>
      )}

      {!loading && !error && data.length > 0 && (
        <div style={grid}>
          {data.map(p => (
            <div key={p.id_pedido} style={card}>
              <h3 style={pedidoStyle}>Pedido #{p.id_pedido}</h3>
              <p>
                <b>Estado:</b>{" "}
                <span style={estadoStyle}>{p.nombre_estado}</span>
              </p>
              <p>
                <b>Fecha:</b>{" "}
                {new Date(p.fecha_creacion).toLocaleString("es-CO")}
              </p>
              <button
                style={btnVer}
                onClick={() => navigate(`/pedido/${p.id_pedido}`)}
              >
                Ver detalle
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const container   = { padding: 30, maxWidth: 1000, margin: "auto" };
const title       = { color: "#c40000", marginBottom: 20 };
const empty       = { textAlign: "center", color: "#777" };
const grid        = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 };
const card        = { padding: 20, borderRadius: 12, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" };
const pedidoStyle = { marginBottom: 10 };
const estadoStyle = { color: "#c40000", fontWeight: "bold" };
const btnVer      = { marginTop: 10, padding: 10, width: "100%", border: "1px solid #c40000", background: "transparent", color: "#c40000", borderRadius: 8, cursor: "pointer" };