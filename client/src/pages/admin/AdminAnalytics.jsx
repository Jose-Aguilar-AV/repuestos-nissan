// pages/admin/AdminAnalytics.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from "recharts";
import {
  getResumen,
  getTopRepuestos,
  getPedidosPorDia,
  getTopClientes,
  getStockAnalytics,
  getEstadosAnalytics,
  getUsuarios,
} from "../../services/api";

const ACENTO = "#7c3aed";
const COLORS = ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

const ESTADO_COLOR = {
  PENDIENTE:    "#f59e0b",
  "EN PROCESO": "#3b82f6",
  FINALIZADO:   "#10b981",
  CANCELADO:    "#ef4444",
};

function Card({ icon, label, value, color = ACENTO, sub, onClick }) {
  return (
    <div
      style={{
        background: "#fff", borderRadius: 16, padding: "22px 18px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0",
        borderTop: `4px solid ${color}`, textAlign: "center",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <div style={{ fontSize: 30, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 900, color, lineHeight: 1 }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function ChartPanel({ title, children, style }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "22px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0", ...style }}>
      <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 800, color: "#1e293b" }}>{title}</h3>
      {children}
    </div>
  );
}

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [resumen,     setResumen]     = useState(null);
  const [topRep,      setTopRep]      = useState([]);
  const [porDia,      setPorDia]      = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  const [stock,       setStock]       = useState([]);
  const [estados,     setEstados]     = useState([]);
  const [usuarios,    setUsuarios]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setError("");
      const [r, tr, pd, tc, st, es, us] = await Promise.all([
        getResumen(),
        getTopRepuestos(),
        getPedidosPorDia(),
        getTopClientes(),
        getStockAnalytics(),
        getEstadosAnalytics(),
        getUsuarios().catch(() => []),
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
      setUsuarios(us || []);
    } catch (e) {
      setError(e.message || "Error cargando analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={s.center}>Cargando analytics globales...</div>;
  if (error)   return <div style={{ ...s.center, color: "#ef4444" }}>{error}</div>;

  // Calcular operadores más activos desde los datos de pedidos
  // (dato aproximado desde usuarios con rol OPERADOR)
  const operadores    = usuarios.filter(u => u.rol === "OPERADOR" || u.rol === "ADMINISTRADOR");
  const clientes      = usuarios.filter(u => u.rol === "CLIENTE");
  const stockCritico  = stock.filter(r => r.stock <= 5);
  const stockBajo     = stock.filter(r => r.stock > 5 && r.stock <= 10);
  const totalStock    = stock.reduce((a, b) => a + (b.stock || 0), 0);

  const tasaCancelacion = resumen?.total > 0
    ? ((resumen.cancelados / resumen.total) * 100).toFixed(1)
    : "0";
  const tasaFinalizacion = resumen?.total > 0
    ? ((resumen.finalizados / resumen.total) * 100).toFixed(1)
    : "0";

  // Datos para gráfico de usuarios por rol
  const usuariosPorRol = [
    { nombre: "Administradores", cantidad: usuarios.filter(u => u.rol === "ADMINISTRADOR").length, color: "#7c3aed" },
    { nombre: "Operadores",      cantidad: usuarios.filter(u => u.rol === "OPERADOR").length,      color: "#0ea5e9" },
    { nombre: "Clientes",        cantidad: usuarios.filter(u => u.rol === "CLIENTE").length,       color: "#10b981" },
  ].filter(x => x.cantidad > 0);

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>📊 Analytics Globales</h1>
          <p style={s.sub}>Métricas completas del sistema · {new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={s.btnRefresh} onClick={cargar}>🔄 Actualizar</button>
          <button style={s.btnBack}    onClick={() => navigate("/admin")}>← Dashboard</button>
        </div>
      </div>

      {/* Stat cards — ventas y pedidos */}
      <div style={{ marginBottom: 10 }}>
        <div style={s.sectionLabel}>Pedidos</div>
      </div>
      <div style={s.cards}>
        <Card icon="📦" label="Total pedidos"    value={resumen?.total}        color={ACENTO}   />
        <Card icon="⏳" label="Pendientes"        value={resumen?.pendientes}   color="#f59e0b"  />
        <Card icon="⚙️" label="En proceso"        value={resumen?.en_proceso}   color="#3b82f6"  />
        <Card icon="✅" label="Finalizados"        value={resumen?.finalizados}  color="#10b981"  />
        <Card icon="❌" label="Cancelados"         value={resumen?.cancelados}   color="#ef4444"  />
        <Card icon="🛎️" label="Pedidos hoy"       value={resumen?.pedidos_hoy}  color="#8b5cf6"  sub="Creados hoy" />
      </div>

      {/* KPIs de rendimiento */}
      <div style={{ marginBottom: 10, marginTop: 6 }}>
        <div style={s.sectionLabel}>Rendimiento</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Tasa cancelación",   value: `${tasaCancelacion}%`,  color: "#ef4444", icon: "❌" },
          { label: "Tasa finalización",  value: `${tasaFinalizacion}%`, color: "#10b981", icon: "✅" },
          { label: "Pedidos activos",    value: (resumen?.pendientes || 0) + (resumen?.en_proceso || 0), color: "#3b82f6", icon: "🔄" },
          { label: "Stock total (uds)",  value: totalStock,             color: ACENTO,    icon: "📦" },
          { label: "Stock crítico",      value: stockCritico.length,    color: "#f97316", icon: "⚠️", sub: "≤ 5 uds" },
        ].map(item => (
          <div key={item.label} style={{
            background: `${item.color}0d`, border: `1px solid ${item.color}33`,
            borderRadius: 12, padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <span style={{ fontSize: 26 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{item.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: item.color }}>{item.value}</div>
              {item.sub && <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Fila 1: Tendencia pedidos + Distribución estados */}
      <div style={s.row2}>
        <ChartPanel title="📅 Tendencia pedidos — últimos 30 días">
          {porDia.length === 0 ? (
            <p style={s.empty}>Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={porDia} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={ACENTO} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={ACENTO} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={v => [v, "Pedidos"]} />
                <Area type="monotone" dataKey="cantidad" stroke={ACENTO} fill="url(#gradAdmin)" strokeWidth={2.5} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>

        <ChartPanel title="🥧 Distribución de estados">
          {estados.length === 0 ? (
            <p style={s.empty}>Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={estados.filter(e => e.cantidad > 0)}
                  dataKey="cantidad"
                  nameKey="nombre_estado"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ nombre_estado, percent }) => `${nombre_estado} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {estados.map(e => (
                    <Cell key={e.nombre_estado} fill={ESTADO_COLOR[e.nombre_estado] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip formatter={v => [v, "Pedidos"]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>
      </div>

      {/* Fila 2: Top repuestos + Top clientes */}
      <div style={s.row2}>
        <ChartPanel title="🔧 Top 10 repuestos más pedidos">
          {topRep.length === 0 ? (
            <p style={s.empty}>Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topRep} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <YAxis type="category" dataKey="nombre" width={115} tick={{ fontSize: 11, fill: "#334155" }} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="total_vendido" fill={ACENTO}    radius={[0, 4, 4, 0]} name="Unidades" />
                <Bar dataKey="pedidos"       fill="#10b981"   radius={[0, 4, 4, 0]} name="Pedidos" />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>

        <ChartPanel title="👥 Clientes más frecuentes">
          {topClientes.length === 0 ? (
            <p style={s.empty}>Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topClientes} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <YAxis type="category" dataKey="nombre" width={110} tick={{ fontSize: 11, fill: "#334155" }} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={v => [v, "Pedidos"]} />
                <Bar dataKey="total_pedidos" radius={[0, 4, 4, 0]} name="Pedidos">
                  {topClientes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>
      </div>

      {/* Fila 3: Usuarios + Stock */}
      <div style={s.row2}>
        {/* Usuarios por rol */}
        <ChartPanel title="👤 Usuarios del sistema">
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
            <Card icon="👑" label="Admins"    value={usuarios.filter(u => u.rol === "ADMINISTRADOR").length} color="#7c3aed" />
            <Card icon="⚙️" label="Operadores" value={operadores.length}  color="#0ea5e9" />
            <Card icon="👤" label="Clientes"   value={clientes.length}    color="#10b981" />
            <Card icon="🔴" label="Inactivos"  value={usuarios.filter(u => u.estado === "INACTIVO").length} color="#ef4444" />
          </div>
          {usuariosPorRol.length > 0 && (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={usuariosPorRol} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: "#334155" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={v => [v, "Usuarios"]} />
                <Bar dataKey="cantidad" radius={[4, 4, 0, 0]} name="Usuarios">
                  {usuariosPorRol.map((u, i) => <Cell key={i} fill={u.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>

        {/* Stock general */}
        <ChartPanel title="📦 Stock por repuesto">
          {stock.length === 0 ? (
            <p style={s.empty}>Sin datos</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stock} margin={{ top: 4, right: 12, left: 0, bottom: 36 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: "#334155" }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={v => [v, "Stock"]} />
                  <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
                    {stock.map((r, i) => <Cell key={i} fill={r.stock <= 5 ? "#ef4444" : r.stock <= 10 ? "#f59e0b" : "#10b981"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
                {[["#ef4444", `Crítico (${stockCritico.length})`], ["#f59e0b", `Bajo (${stockBajo.length})`], ["#10b981", "OK"]].map(([c, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
                    {l}
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartPanel>
      </div>

      {/* Alertas críticas */}
      {stockCritico.length > 0 && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 14px", color: "#f97316", fontSize: 15, fontWeight: 800 }}>
            ⚠️ {stockCritico.length} repuesto(s) con stock crítico
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {stockCritico.map(r => (
              <div key={r.id_repuesto} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#fff", border: "1px solid #fed7aa", borderRadius: 20,
                padding: "6px 14px", fontSize: 13,
              }}>
                <span style={{ fontWeight: 700 }}>{r.nombre}</span>
                <span style={{ background: r.stock === 0 ? "#ef4444" : "#f97316", color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                  {r.stock} uds
                </span>
              </div>
            ))}
          </div>
          <button
            style={{ marginTop: 14, background: "#f97316", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
            onClick={() => navigate("/admin/repuestos")}
          >
            Gestionar repuestos →
          </button>
        </div>
      )}
    </div>
  );
}

const s = {
  page:         { padding: "30px 36px", maxWidth: 1400, margin: "auto" },
  center:       { textAlign: "center", padding: 80, color: "#64748b", fontSize: 18 },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 },
  title:        { margin: 0, fontSize: "1.9rem", color: "#7c3aed", fontWeight: 900 },
  sub:          { margin: "5px 0 0", color: "#64748b", fontSize: 14 },
  btnRefresh:   { background: "#7c3aed", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 9, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  btnBack:      { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", padding: "9px 18px", borderRadius: 9, fontWeight: 600, cursor: "pointer", fontSize: 14 },
  sectionLabel: { fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  cards:        { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 24 },
  row2:         { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20, marginBottom: 20 },
  empty:        { color: "#94a3b8", fontStyle: "italic", textAlign: "center", padding: 30 },
};