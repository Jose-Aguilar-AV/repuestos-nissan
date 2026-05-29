import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import {
  getResumen,
  getTopRepuestos,
  getPedidosPorDia,
  getTopClientes,
  getStockAnalytics,
  getEstadosAnalytics,
} from "../../services/api";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const ESTADO_COLOR = {
  PENDIENTE:  "#f59e0b",
  "EN PROCESO": "#3b82f6",
  FINALIZADO: "#10b981",
  CANCELADO:  "#ef4444",
};

function StatCard({ icon, label, value, color = "#0ea5e9", sub }) {
  return (
    <div style={{ ...s.card, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function OperadorAnalytics() {
  const navigate = useNavigate();
  const [resumen,     setResumen]     = useState(null);
  const [topRep,      setTopRep]      = useState([]);
  const [porDia,      setPorDia]      = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  const [stock,       setStock]       = useState([]);
  const [estados,     setEstados]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setError("");
      const [r, tr, pd, tc, st, es] = await Promise.all([
        getResumen(),
        getTopRepuestos(),
        getPedidosPorDia(),
        getTopClientes(),
        getStockAnalytics(),
        getEstadosAnalytics(),
      ]);
      setResumen(r);
      setTopRep(tr || []);
      setPorDia(
        (pd || []).map(d => ({
          ...d,
          fecha: new Date(d.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
        }))
      );
      setTopClientes(tc || []);
      setStock(st || []);
      setEstados(es || []);
    } catch (e) {
      setError(e.message || "Error cargando analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={s.center}>Cargando analytics...</div>;
  if (error)   return <div style={{ ...s.center, color: "#ef4444" }}>{error}</div>;

  const stockBajo = stock.filter(r => r.stock <= 5);

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Analytics</h1>
          <p style={s.sub}>Resumen operativo en tiempo real</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={s.btnSecondary} onClick={cargar}>Actualizar</button>
          <button style={s.btnBack} onClick={() => navigate("/operador")}>← Panel</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={s.cards}>
        <StatCard icon="📦" label="Total pedidos"    value={resumen?.total}       color="#0ea5e9" />
        <StatCard icon="⏳" label="Pendientes"        value={resumen?.pendientes}   color="#f59e0b" />
        <StatCard icon="⚙️" label="En proceso"        value={resumen?.en_proceso}   color="#3b82f6" />
        <StatCard icon="✅" label="Finalizados"        value={resumen?.finalizados}  color="#10b981" />
        <StatCard icon="❌" label="Cancelados"         value={resumen?.cancelados}   color="#ef4444" />
        <StatCard icon="🛎️" label="Pedidos hoy"       value={resumen?.pedidos_hoy}  color="#8b5cf6" />
        <StatCard
          icon="⚠️"
          label="Bajo stock"
          value={resumen?.repuestos_bajo_stock}
          color="#f97316"
          sub="≤ 5 unidades"
        />
      </div>

      {/* Fila 1: Pedidos por día + Estados */}
      <div style={s.row2}>
        {/* Línea pedidos por día */}
        <div style={s.chartBox}>
          <h3 style={s.chartTitle}>Pedidos últimos 30 días</h3>
          {porDia.length === 0 ? (
            <p style={s.empty}>Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={porDia} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, fontSize: 13, border: "1px solid #e2e8f0" }}
                  formatter={v => [v, "Pedidos"]}
                />
                <Line
                  type="monotone"
                  dataKey="cantidad"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#0ea5e9" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie estados */}
        <div style={s.chartBox}>
          <h3 style={s.chartTitle}>Distribución por estado</h3>
          {estados.length === 0 ? (
            <p style={s.empty}>Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={estados}
                  dataKey="cantidad"
                  nameKey="nombre_estado"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ nombre_estado, percent }) =>
                    `${nombre_estado} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {estados.map((e, i) => (
                    <Cell
                      key={e.nombre_estado}
                      fill={ESTADO_COLOR[e.nombre_estado] || COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={v => [v, "Pedidos"]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Fila 2: Top repuestos + Top clientes */}
      <div style={s.row2}>
        {/* Barras top repuestos */}
        <div style={s.chartBox}>
          <h3 style={s.chartTitle}>🔧 Top 10 repuestos más vendidos</h3>
          {topRep.length === 0 ? (
            <p style={s.empty}>Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={topRep}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  width={120}
                  tick={{ fontSize: 11, fill: "#334155" }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 10, fontSize: 13 }}
                  formatter={(v, n) => [v, n === "total_vendido" ? "Unidades" : "Pedidos"]}
                />
                <Bar dataKey="total_vendido" fill="#0ea5e9" radius={[0, 4, 4, 0]} name="Unidades" />
                <Bar dataKey="pedidos"       fill="#10b981" radius={[0, 4, 4, 0]} name="Pedidos" />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top clientes */}
        <div style={s.chartBox}>
          <h3 style={s.chartTitle}>Clientes frecuentes</h3>
          {topClientes.length === 0 ? (
            <p style={s.empty}>Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={topClientes}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  width={110}
                  tick={{ fontSize: 11, fill: "#334155" }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 10, fontSize: 13 }}
                  formatter={v => [v, "Pedidos"]}
                />
                <Bar dataKey="total_pedidos" radius={[0, 4, 4, 0]} name="Pedidos">
                  {topClientes.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Stock bajo */}
      {stockBajo.length > 0 && (
        <div style={s.alertBox}>
          <h3 style={{ margin: "0 0 14px", color: "#f97316", fontSize: 16 }}>
            ⚠️ Repuestos con stock bajo (≤ 5 unidades)
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {stockBajo.map(r => (
              <div key={r.id_repuesto} style={s.stockChip}>
                <span style={{ fontWeight: 700 }}>{r.nombre}</span>
                <span style={s.stockBadge}>{r.stock} uds</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock general */}
      <div style={s.chartBox}>
        <h3 style={s.chartTitle}>Stock actual por repuesto</h3>
        {stock.length === 0 ? (
          <p style={s.empty}>Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stock} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="nombre"
                tick={{ fontSize: 11, fill: "#334155" }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, fontSize: 13 }}
                formatter={v => [v, "Stock"]}
              />
              <Bar dataKey="stock" radius={[4, 4, 0, 0]} name="Stock">
                {stock.map((r, i) => (
                  <Cell key={i} fill={r.stock <= 5 ? "#ef4444" : r.stock <= 10 ? "#f59e0b" : "#10b981"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
          {[["#ef4444", "Crítico (≤5)"], ["#f59e0b", "Bajo (≤10)"], ["#10b981", "OK"]].map(([c, l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page:        { padding: "30px 36px", maxWidth: 1300, margin: "auto" },
  center:      { textAlign: "center", padding: 80, color: "#64748b", fontSize: 18 },
  header:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 },
  title:       { margin: 0, fontSize: "1.9rem", color: "#0ea5e9", fontWeight: 900 },
  sub:         { margin: "4px 0 0", color: "#64748b", fontSize: 14 },
  btnBack:     { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", padding: "9px 18px", borderRadius: 9, fontWeight: 600, cursor: "pointer", fontSize: 14 },
  btnSecondary:{ background: "#0ea5e9", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 9, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  cards:       { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 },
  card:        { background: "#fff", borderRadius: 14, padding: "20px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0", textAlign: "center" },
  row2:        { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20, marginBottom: 20 },
  chartBox:    { background: "#fff", borderRadius: 14, padding: "22px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0", marginBottom: 20 },
  chartTitle:  { margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: "#1e293b" },
  empty:       { color: "#94a3b8", fontStyle: "italic", textAlign: "center", padding: 30 },
  alertBox:    { background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 14, padding: "20px 24px", marginBottom: 20 },
  stockChip:   { display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #fed7aa", borderRadius: 20, padding: "6px 14px", fontSize: 13 },
  stockBadge:  { background: "#f97316", color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 },
};