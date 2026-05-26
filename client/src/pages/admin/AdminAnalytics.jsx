// client/src/pages/admin/AdminAnalytics.jsx
// RF9 FIX: exportación PDF (jsPDF) y Excel (SheetJS), filtros por rango de fechas
import { useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
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
    <div style={{ background: "#fff", borderRadius: 16, padding: "22px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0", borderTop: `4px solid ${color}`, textAlign: "center", cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
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

  // RF9 FIX: filtros por rango de fechas
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => { cargar(); }, []);

  const cargar = async (desde = fechaDesde, hasta = fechaHasta) => {
    try {
      setLoading(true); setError("");
      const filtros = {};
      if (desde) filtros.fecha_desde = desde;
      if (hasta) filtros.fecha_hasta = hasta;

      const [r, tr, pd, tc, st, es, us] = await Promise.all([
        getResumen(filtros),
        getTopRepuestos(filtros),
        getPedidosPorDia(filtros),
        getTopClientes(),
        getStockAnalytics(),
        getEstadosAnalytics(),
        getUsuarios().catch(() => []),
      ]);
      setResumen(r);
      setTopRep(tr || []);
      setPorDia((pd || []).map(d => ({
        ...d,
        fecha: new Date(d.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
      })));
      setTopClientes(tc || []);
      setStock(st || []);
      setEstados(es || []);
      setUsuarios(us || []);
    } catch (e) {
      setError(e.message || "Error cargando analytics");
    } finally {
      setLoading(false); }
  };

  const aplicarFiltros = () => cargar(fechaDesde, fechaHasta);
  const limpiarFiltros = () => {
    setFechaDesde(""); setFechaHasta("");
    cargar("", "");
  };

  // RF9 FIX: exportar Excel con SheetJS
  const exportarExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const wb   = XLSX.utils.book_new();
  
      // ── Utilidad: aplicar estilos a rango ──
      const styleRange = (ws, range, style) => {
        if (!ws["!styles"]) ws["!styles"] = {};
        for (let R = range.s.r; R <= range.e.r; R++) {
          for (let C = range.s.c; C <= range.e.c; C++) {
            const addr = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[addr]) ws[addr] = { v: "", t: "s" };
            ws[addr].s = style;
          }
        }
      };
  
      const headerStyle = {
        fill: { fgColor: { rgb: "7C3AED" } },
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
        alignment: { horizontal: "center" },
        border: {
          top:    { style: "thin", color: { rgb: "5B21B6" } },
          bottom: { style: "thin", color: { rgb: "5B21B6" } },
          left:   { style: "thin", color: { rgb: "5B21B6" } },
          right:  { style: "thin", color: { rgb: "5B21B6" } },
        },
      };
  
      const altStyle = {
        fill: { fgColor: { rgb: "F5F3FF" } },
        font: { sz: 10 },
        border: {
          top:    { style: "thin", color: { rgb: "DDD6FE" } },
          bottom: { style: "thin", color: { rgb: "DDD6FE" } },
          left:   { style: "thin", color: { rgb: "DDD6FE" } },
          right:  { style: "thin", color: { rgb: "DDD6FE" } },
        },
      };
  
      const titleStyle = {
        font: { bold: true, sz: 14, color: { rgb: "5B21B6" } },
        alignment: { horizontal: "left" },
      };
  
      // ── HOJA 1: Resumen ejecutivo ──
      if (resumen) {
        const tasaCanc = resumen.total > 0 ? ((resumen.cancelados / resumen.total) * 100).toFixed(1) : "0";
        const tasaFin  = resumen.total > 0 ? ((resumen.finalizados / resumen.total) * 100).toFixed(1) : "0";
        const activos  = (resumen.pendientes || 0) + (resumen.en_proceso || 0);
  
        const resumenData = [
          [`REPORTE ANALYTICS — NISSAN PARTS`, "", "", ""],
          [`Generado: ${new Date().toLocaleString("es-CO")}`, "", "", ""],
          ["", "", "", ""],
          ["MÉTRICA", "VALOR", "PORCENTAJE", "TENDENCIA"],
          ["Total de pedidos",         resumen.total        || 0, "100%",           ""],
          ["Pedidos pendientes",        resumen.pendientes   || 0, `${((resumen.pendientes||0)/(resumen.total||1)*100).toFixed(1)}%`, "⏳"],
          ["Pedidos en proceso",        resumen.en_proceso   || 0, `${((resumen.en_proceso||0)/(resumen.total||1)*100).toFixed(1)}%`, "🔄"],
          ["Pedidos finalizados",       resumen.finalizados  || 0, `${tasaFin}%`,   "✅"],
          ["Pedidos cancelados",        resumen.cancelados   || 0, `${tasaCanc}%`,  "❌"],
          ["Pedidos creados hoy",       resumen.pedidos_hoy  || 0, "",              "📅"],
          ["Pedidos activos (total)",   activos,                   `${(activos/(resumen.total||1)*100).toFixed(1)}%`, ""],
          ["", "", "", ""],
          ["KPI DE RENDIMIENTO", "VALOR", "", ""],
          ["Tasa de cancelación",       `${tasaCanc}%`,  "", resumen.cancelados > 5 ? "⚠️ Alto" : "✅ Normal"],
          ["Tasa de finalización",      `${tasaFin}%`,   "", resumen.finalizados > resumen.pendientes ? "✅ Bien" : "⚠️ Revisar"],
          ["Repuestos con stock crítico (≤5)", resumen.repuestos_bajo_stock || 0, "", resumen.repuestos_bajo_stock > 0 ? "⚠️ Atención" : "✅ OK"],
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(resumenData);
        ws1["!cols"] = [{ wch: 34 }, { wch: 18 }, { wch: 16 }, { wch: 16 }];
        ws1["!merges"] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
        ];
        if (ws1.A1) ws1.A1.s = titleStyle;
        styleRange(ws1, { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } }, headerStyle);
        styleRange(ws1, { s: { r: 12, c: 0 }, e: { r: 12, c: 3 } }, headerStyle);
        XLSX.utils.book_append_sheet(wb, ws1, "📊 Resumen Ejecutivo");
      }
  
      // ── HOJA 2: Top Repuestos detallado ──
      if (topRep.length) {
        const repData = [
          ["TOP REPUESTOS MÁS PEDIDOS", "", "", "", ""],
          ["", "", "", "", ""],
          ["#", "NOMBRE DEL REPUESTO", "CATEGORÍA", "UNIDADES VENDIDAS", "Nº PEDIDOS", "PARTICIPACIÓN %"],
          ...topRep.map((r, i) => [
            i + 1,
            r.nombre,
            r.categoria || "Sin categoría",
            r.total_vendido,
            r.pedidos,
            `${((r.pedidos / (resumen?.total || 1)) * 100).toFixed(1)}%`,
          ]),
          ["", "", "", "", ""],
          ["TOTALES", "", "",
            topRep.reduce((s, r) => s + (r.total_vendido || 0), 0),
            topRep.reduce((s, r) => s + (r.pedidos || 0), 0),
            ""],
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(repData);
        ws2["!cols"] = [{ wch: 5 }, { wch: 32 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 16 }];
        ws2["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
        if (ws2.A1) ws2.A1.s = titleStyle;
        styleRange(ws2, { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }, headerStyle);
        // Filas alternas
        repData.forEach((_, i) => {
          if (i > 2 && i < repData.length - 2 && i % 2 === 0) {
            styleRange(ws2, { s: { r: i, c: 0 }, e: { r: i, c: 5 } }, altStyle);
          }
        });
        // Fila totales
        styleRange(ws2, { s: { r: repData.length - 1, c: 0 }, e: { r: repData.length - 1, c: 5 } }, {
          ...headerStyle,
          fill: { fgColor: { rgb: "10B981" } },
        });
        XLSX.utils.book_append_sheet(wb, ws2, "🔩 Top Repuestos");
      }
  
      // ── HOJA 3: Pedidos por día ──
      if (porDia.length) {
        const maxDia = porDia.reduce((a, b) => (b.cantidad > a.cantidad ? b : a), porDia[0]);
        const minDia = porDia.reduce((a, b) => (b.cantidad < a.cantidad ? b : a), porDia[0]);
        const promedio = (porDia.reduce((s, d) => s + (d.cantidad || 0), 0) / porDia.length).toFixed(1);
  
        const diaData = [
          ["TENDENCIA DE PEDIDOS POR DÍA", "", ""],
          [`Período: ${porDia[0]?.fecha || ""} → ${porDia[porDia.length - 1]?.fecha || ""}`, "", ""],
          ["", "", ""],
          ["FECHA", "CANTIDAD DE PEDIDOS", "VS PROMEDIO"],
          ...porDia.map(d => [
            d.fecha,
            d.cantidad,
            d.cantidad >= promedio ? `+${(d.cantidad - promedio).toFixed(0)} sobre promedio` : `${(d.cantidad - promedio).toFixed(0)} bajo promedio`,
          ]),
          ["", "", ""],
          ["ESTADÍSTICAS", "", ""],
          ["Promedio diario",  promedio,          ""],
          ["Día más activo",   maxDia.fecha,       maxDia.cantidad],
          ["Día menos activo", minDia.fecha,       minDia.cantidad],
          ["Total del período", porDia.reduce((s, d) => s + (d.cantidad || 0), 0), ""],
        ];
        const ws3 = XLSX.utils.aoa_to_sheet(diaData);
        ws3["!cols"] = [{ wch: 22 }, { wch: 22 }, { wch: 28 }];
        ws3["!merges"] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
        ];
        if (ws3.A1) ws3.A1.s = titleStyle;
        styleRange(ws3, { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } }, headerStyle);
        XLSX.utils.book_append_sheet(wb, ws3, "📈 Pedidos por Día");
      }
  
      // ── HOJA 4: Top Clientes ──
      if (topClientes.length) {
        const cliData = [
          ["TOP CLIENTES MÁS FRECUENTES", "", ""],
          ["", "", ""],
          ["#", "NOMBRE DEL CLIENTE", "TOTAL PEDIDOS", "PARTICIPACIÓN %"],
          ...topClientes.map((c, i) => [
            i + 1,
            c.nombre,
            c.total_pedidos,
            `${((c.total_pedidos / (resumen?.total || 1)) * 100).toFixed(1)}%`,
          ]),
          ["", "", "", ""],
          ["TOTAL", "", topClientes.reduce((s, c) => s + (c.total_pedidos || 0), 0), ""],
        ];
        const ws4 = XLSX.utils.aoa_to_sheet(cliData);
        ws4["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 18 }, { wch: 18 }];
        ws4["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
        if (ws4.A1) ws4.A1.s = titleStyle;
        styleRange(ws4, { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }, headerStyle);
        XLSX.utils.book_append_sheet(wb, ws4, "👤 Top Clientes");
      }
  
      // ── HOJA 5: Stock completo ──
      if (stock.length) {
        const stockData = [
          ["INVENTARIO COMPLETO DE REPUESTOS", "", "", "", ""],
          [`Generado: ${new Date().toLocaleString("es-CO")}`, "", "", "", ""],
          ["", "", "", "", ""],
          ["ID", "NOMBRE", "CATEGORÍA", "STOCK ACTUAL", "ESTADO"],
          ...stock.map(r => [
            r.id_repuesto,
            r.nombre,
            r.categoria || "Sin categoría",
            r.stock,
            r.stock === 0 ? "SIN STOCK" : r.stock <= 5 ? "CRÍTICO" : r.stock <= 10 ? "BAJO" : "NORMAL",
          ]),
          ["", "", "", "", ""],
          ["RESUMEN DE INVENTARIO", "", "", "", ""],
          ["Stock total (unidades)",        stock.reduce((a, b) => a + (b.stock || 0), 0), "", "", ""],
          ["Repuestos sin stock",           stock.filter(r => r.stock === 0).length, "", "", ""],
          ["Repuestos críticos (1-5 uds)",  stock.filter(r => r.stock > 0 && r.stock <= 5).length, "", "", ""],
          ["Repuestos con stock bajo (6-10)", stock.filter(r => r.stock > 5 && r.stock <= 10).length, "", "", ""],
          ["Repuestos con stock normal (>10)", stock.filter(r => r.stock > 10).length, "", "", ""],
        ];
        const ws5 = XLSX.utils.aoa_to_sheet(stockData);
        ws5["!cols"] = [{ wch: 8 }, { wch: 32 }, { wch: 18 }, { wch: 16 }, { wch: 14 }];
        ws5["!merges"] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
        ];
        if (ws5.A1) ws5.A1.s = titleStyle;
        styleRange(ws5, { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } }, headerStyle);
        XLSX.utils.book_append_sheet(wb, ws5, "📦 Inventario Stock");
      }
  
      // ── HOJA 6: Distribución de estados ──
      if (estados.length) {
        const total = estados.reduce((s, e) => s + (e.cantidad || 0), 0);
        const estData = [
          ["DISTRIBUCIÓN DE ESTADOS DE PEDIDOS", "", ""],
          ["", "", ""],
          ["ESTADO", "CANTIDAD", "PORCENTAJE"],
          ...estados.map(e => [
            e.nombre_estado,
            e.cantidad,
            `${((e.cantidad / (total || 1)) * 100).toFixed(1)}%`,
          ]),
          ["", "", ""],
          ["TOTAL", total, "100%"],
        ];
        const ws6 = XLSX.utils.aoa_to_sheet(estData);
        ws6["!cols"] = [{ wch: 20 }, { wch: 14 }, { wch: 14 }];
        ws6["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
        if (ws6.A1) ws6.A1.s = titleStyle;
        styleRange(ws6, { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }, headerStyle);
        XLSX.utils.book_append_sheet(wb, ws6, "📋 Estados");
      }
  
      // ── HOJA 7: Usuarios ──
      if (usuarios.length) {
        const usData = [
          ["USUARIOS DEL SISTEMA", "", "", ""],
          ["", "", "", ""],
          ["ID", "NOMBRE / EMAIL", "ROL", "ESTADO"],
          ...usuarios.map(u => [
            u.id_usuario || u.id || "",
            u.nombre || u.email || "",
            u.rol,
            u.estado || "ACTIVO",
          ]),
          ["", "", "", ""],
          ["TOTALES POR ROL", "", "", ""],
          ["Administradores", usuarios.filter(u => u.rol === "ADMINISTRADOR").length, "", ""],
          ["Operadores",      usuarios.filter(u => u.rol === "OPERADOR").length,      "", ""],
          ["Clientes",        usuarios.filter(u => u.rol === "CLIENTE").length,       "", ""],
          ["Inactivos",       usuarios.filter(u => u.estado === "INACTIVO").length,   "", ""],
        ];
        const ws7 = XLSX.utils.aoa_to_sheet(usData);
        ws7["!cols"] = [{ wch: 8 }, { wch: 30 }, { wch: 18 }, { wch: 14 }];
        ws7["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
        if (ws7.A1) ws7.A1.s = titleStyle;
        styleRange(ws7, { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }, headerStyle);
        XLSX.utils.book_append_sheet(wb, ws7, "👥 Usuarios");
      }
  
      XLSX.writeFile(wb, `analytics_nissan_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (e) {
      alert("Error al exportar Excel: " + e.message);
    }
  };

  // RF9 FIX: exportar PDF con jsPDF
  // ─────────────────────────────────────────────────────────────
// BLOQUE 2: Reemplaza la función exportarPDF (dentro de AdminAnalytics)
// ─────────────────────────────────────────────────────────────
 
// Helper: dibuja un gráfico de barras horizontales en canvas y devuelve dataURL
  const dibujarBarrasH = (labels, values, colors, width = 480, height = 220) => {
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    const maxVal = Math.max(...values, 1);
    const barH = 22, gap = 8, labelW = 120, padL = 14, padT = 16, padR = 20;
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);
    values.forEach((v, i) => {
      const y = padT + i * (barH + gap);
      const barW = ((v / maxVal) * (width - labelW - padL - padR));
      // label
      ctx.fillStyle = "#334155"; ctx.font = "bold 11px sans-serif";
      ctx.textBaseline = "middle";
      const label = labels[i]?.length > 16 ? labels[i].slice(0, 15) + "…" : labels[i];
      ctx.fillText(label, padL, y + barH / 2);
      // barra
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.roundRect(labelW, y, barW, barH, 4);
      ctx.fill();
      // valor
      ctx.fillStyle = "#1e293b"; ctx.font = "bold 10px sans-serif";
      ctx.fillText(v, labelW + barW + 6, y + barH / 2);
    });
    return canvas.toDataURL("image/png");
  };
  
  // Helper: dibuja un pie chart y devuelve dataURL
  const dibujarPie = (labels, values, colors, size = 200) => {
    const canvas = document.createElement("canvas");
    canvas.width = size * 2.4; canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(0, 0, canvas.width, size);
    const total = values.reduce((a, b) => a + b, 0) || 1;
    const cx = size / 2, cy = size / 2, r = size / 2 - 10;
    let angle = -Math.PI / 2;
    values.forEach((v, i) => {
      const slice = (v / total) * 2 * Math.PI;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.closePath(); ctx.fillStyle = colors[i % colors.length]; ctx.fill();
      angle += slice;
    });
    // leyenda
    const lx = size + 10, ly0 = 16;
    labels.forEach((l, i) => {
      const ly = ly0 + i * 22;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(lx, ly, 14, 14);
      ctx.fillStyle = "#334155"; ctx.font = "11px sans-serif"; ctx.textBaseline = "top";
      const pct = ((values[i] / total) * 100).toFixed(0);
      ctx.fillText(`${l} (${pct}%)`, lx + 20, ly + 1);
    });
    return canvas.toDataURL("image/png");
  };
  
  // Helper: dibuja tendencia (área) y devuelve dataURL
  const dibujarArea = (labels, values, width = 480, height = 130) => {
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(0, 0, width, height);
    const padL = 30, padR = 16, padT = 10, padB = 28;
    const maxV = Math.max(...values, 1);
    const pts = values.map((v, i) => ({
      x: padL + (i / Math.max(values.length - 1, 1)) * (width - padL - padR),
      y: padT + (1 - v / maxV) * (height - padT - padB),
    }));
    // área
    const grad = ctx.createLinearGradient(0, padT, 0, height - padB);
    grad.addColorStop(0, "rgba(124,58,237,0.25)"); grad.addColorStop(1, "rgba(124,58,237,0.02)");
    ctx.beginPath(); ctx.moveTo(pts[0].x, height - padB);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, height - padB); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    // línea
    ctx.beginPath(); pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = 2; ctx.stroke();
    // puntos
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#7c3aed"; ctx.fill();
    });
    // labels eje X (cada n)
    const step = Math.max(1, Math.floor(labels.length / 6));
    ctx.fillStyle = "#64748b"; ctx.font = "9px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "top";
    pts.forEach((p, i) => {
      if (i % step === 0) ctx.fillText(labels[i], p.x, height - padB + 4);
    });
    return canvas.toDataURL("image/png");
  };
  
  const exportarPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const PW = 210, ML = 16, MR = 16, CW = PW - ML - MR;
      const ACENTO_R = 124, ACENTO_G = 58, ACENTO_B = 237;
      const fecha = new Date().toLocaleString("es-CO");
      let page = 1;
  
      const nuevaPagina = () => {
        doc.addPage();
        page++;
        // footer
        doc.setFontSize(8); doc.setTextColor(148, 163, 184);
        doc.text(`Nissan Parts Analytics · Página ${page}`, PW / 2, 292, { align: "center" });
      };
  
      const checkY = (y, needed = 30) => {
        if (y + needed > 275) { nuevaPagina(); return 20; }
        return y;
      };
  
      // ── PORTADA ──
      doc.setFillColor(ACENTO_R, ACENTO_G, ACENTO_B);
      doc.rect(0, 0, PW, 60, "F");
      doc.setFillColor(91, 33, 182);
      doc.rect(0, 54, PW, 8, "F");
      doc.setFontSize(24); doc.setTextColor(255, 255, 255); doc.setFont(undefined, "bold");
      doc.text("ANALYTICS GLOBALES", PW / 2, 28, { align: "center" });
      doc.setFontSize(13); doc.setFont(undefined, "normal");
      doc.text("Nissan Parts — Reporte Ejecutivo", PW / 2, 38, { align: "center" });
      doc.setFontSize(9);
      doc.text(`Generado: ${fecha}`, PW / 2, 48, { align: "center" });
      if (fechaDesde || fechaHasta) {
        doc.text(`Período filtrado: ${fechaDesde || "inicio"} → ${fechaHasta || "hoy"}`, PW / 2, 54, { align: "center" });
      }
  
      // footer pág 1
      doc.setFontSize(8); doc.setTextColor(148, 163, 184);
      doc.text(`Nissan Parts Analytics · Página 1`, PW / 2, 292, { align: "center" });
  
      let y = 72;
  
      // ── SECCIÓN 1: RESUMEN ──
      doc.setFontSize(14); doc.setTextColor(ACENTO_R, ACENTO_G, ACENTO_B); doc.setFont(undefined, "bold");
      doc.text("1. Resumen de Pedidos", ML, y); y += 7;
      doc.setDrawColor(ACENTO_R, ACENTO_G, ACENTO_B); doc.setLineWidth(0.4);
      doc.line(ML, y, ML + CW, y); y += 6;
  
      if (resumen) {
        const tasaCanc = resumen.total > 0 ? ((resumen.cancelados / resumen.total) * 100).toFixed(1) : "0";
        const tasaFin  = resumen.total > 0 ? ((resumen.finalizados / resumen.total) * 100).toFixed(1) : "0";
        const activos  = (resumen.pendientes || 0) + (resumen.en_proceso || 0);
  
        // Tarjetas de resumen en 3 columnas
        const cards = [
          { label: "Total",       value: resumen.total || 0,       color: [124, 58, 237] },
          { label: "Pendientes",  value: resumen.pendientes || 0,  color: [245, 158, 11] },
          { label: "En proceso",  value: resumen.en_proceso || 0,  color: [59, 130, 246] },
          { label: "Finalizados", value: resumen.finalizados || 0, color: [16, 185, 129] },
          { label: "Cancelados",  value: resumen.cancelados || 0,  color: [239, 68, 68]  },
          { label: "Hoy",         value: resumen.pedidos_hoy || 0, color: [139, 92, 246] },
        ];
        const cols = 3, cardW = CW / cols - 2, cardH = 22;
        cards.forEach((c, i) => {
          const cx = ML + (i % cols) * (cardW + 3);
          const cy = y + Math.floor(i / cols) * (cardH + 4);
          doc.setFillColor(...c.color); doc.setDrawColor(...c.color);
          doc.roundedRect(cx, cy, cardW, cardH, 2, 2, "F");
          doc.setFontSize(16); doc.setTextColor(255, 255, 255); doc.setFont(undefined, "bold");
          doc.text(String(c.value), cx + cardW / 2, cy + 12, { align: "center" });
          doc.setFontSize(7); doc.setFont(undefined, "normal");
          doc.text(c.label.toUpperCase(), cx + cardW / 2, cy + 19, { align: "center" });
        });
        y += 2 * (cardH + 4) + 10;
  
        // KPIs fila
        doc.setFontSize(9); doc.setTextColor(30, 41, 59); doc.setFont(undefined, "normal");
        const kpis = [
          `Tasa cancelación: ${tasaCanc}%`,
          `Tasa finalización: ${tasaFin}%`,
          `Activos: ${activos}`,
          `Stock crítico: ${resumen.repuestos_bajo_stock || 0}`,
        ];
        kpis.forEach((k, i) => {
          doc.setFillColor(245, 243, 255); doc.roundedRect(ML + i * (CW / 4 + 1), y, CW / 4 - 1, 10, 2, 2, "F");
          doc.setTextColor(91, 33, 182); doc.setFont(undefined, "bold"); doc.setFontSize(8);
          doc.text(k, ML + i * (CW / 4 + 1) + (CW / 4 - 1) / 2, y + 6.5, { align: "center" });
        });
        y += 18;
      }
  
      // ── SECCIÓN 2: GRÁFICO TENDENCIA ──
      y = checkY(y, 55);
      doc.setFontSize(14); doc.setTextColor(ACENTO_R, ACENTO_G, ACENTO_B); doc.setFont(undefined, "bold");
      doc.text("2. Tendencia de Pedidos por Día", ML, y); y += 6;
      doc.setDrawColor(ACENTO_R, ACENTO_G, ACENTO_B); doc.line(ML, y, ML + CW, y); y += 5;
  
      if (porDia.length > 0) {
        const imgArea = dibujarArea(porDia.map(d => d.fecha), porDia.map(d => d.cantidad), 480, 130);
        doc.addImage(imgArea, "PNG", ML, y, CW, 40);
        y += 44;
        // Tabla compacta (max 10 filas)
        doc.setFontSize(8); doc.setFont(undefined, "normal"); doc.setTextColor(71, 85, 105);
        const colF = 60, colC = 40;
        doc.setFillColor(124, 58, 237); doc.rect(ML, y, colF, 6, "F");
        doc.rect(ML + colF, y, colC, 6, "F");
        doc.setTextColor(255, 255, 255); doc.setFont(undefined, "bold");
        doc.text("Fecha", ML + 2, y + 4.5);
        doc.text("Pedidos", ML + colF + 2, y + 4.5);
        y += 6;
        porDia.slice(0, 10).forEach((d, i) => {
          if (i % 2 === 0) { doc.setFillColor(245, 243, 255); doc.rect(ML, y, colF + colC, 5.5, "F"); }
          doc.setTextColor(30, 41, 59); doc.setFont(undefined, "normal"); doc.setFontSize(8);
          doc.text(d.fecha, ML + 2, y + 4);
          doc.text(String(d.cantidad), ML + colF + 2, y + 4);
          y += 5.5;
        });
        if (porDia.length > 10) {
          doc.setFontSize(7); doc.setTextColor(148, 163, 184);
          doc.text(`... y ${porDia.length - 10} días más`, ML, y + 4); y += 8;
        }
        y += 4;
      } else {
        doc.setFontSize(9); doc.setTextColor(148, 163, 184);
        doc.text("Sin datos en el período seleccionado.", ML, y); y += 10;
      }
  
      // ── SECCIÓN 3: DISTRIBUCIÓN ESTADOS ──
      y = checkY(y, 65);
      doc.setFontSize(14); doc.setTextColor(ACENTO_R, ACENTO_G, ACENTO_B); doc.setFont(undefined, "bold");
      doc.text("3. Distribución de Estados", ML, y); y += 6;
      doc.line(ML, y, ML + CW, y); y += 5;
  
      if (estados.length > 0) {
        const eLabels = estados.map(e => e.nombre_estado);
        const eVals   = estados.map(e => e.cantidad);
        const eCols   = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"];
        const imgPie  = dibujarPie(eLabels, eVals, eCols, 180);
        doc.addImage(imgPie, "PNG", ML, y, CW * 0.75, 46);
        y += 50;
        // tabla estados
        doc.setFontSize(8); doc.setFillColor(124, 58, 237); doc.rect(ML, y, 60, 6, "F"); doc.rect(ML + 60, y, 30, 6, "F"); doc.rect(ML + 90, y, 30, 6, "F");
        doc.setTextColor(255, 255, 255); doc.setFont(undefined, "bold");
        doc.text("Estado", ML + 2, y + 4.5); doc.text("Cantidad", ML + 62, y + 4.5); doc.text("Porcentaje", ML + 92, y + 4.5);
        y += 6;
        const totalEst = eVals.reduce((a, b) => a + b, 0) || 1;
        estados.forEach((e, i) => {
          if (i % 2 === 0) { doc.setFillColor(245, 243, 255); doc.rect(ML, y, 120, 5.5, "F"); }
          doc.setTextColor(30, 41, 59); doc.setFont(undefined, "normal"); doc.setFontSize(8);
          doc.text(e.nombre_estado, ML + 2, y + 4);
          doc.text(String(e.cantidad), ML + 62, y + 4);
          doc.text(`${((e.cantidad / totalEst) * 100).toFixed(1)}%`, ML + 92, y + 4);
          y += 5.5;
        });
        y += 6;
      }
  
      // ── SECCIÓN 4: TOP REPUESTOS ──
      y = checkY(y, 70);
      nuevaPagina(); y = 20;
      doc.setFontSize(14); doc.setTextColor(ACENTO_R, ACENTO_G, ACENTO_B); doc.setFont(undefined, "bold");
      doc.text("4. Top Repuestos Más Pedidos", ML, y); y += 6;
      doc.setDrawColor(ACENTO_R, ACENTO_G, ACENTO_B); doc.line(ML, y, ML + CW, y); y += 5;
  
      if (topRep.length > 0) {
        const top10 = topRep.slice(0, 10);
        const imgRep = dibujarBarrasH(top10.map(r => r.nombre), top10.map(r => r.total_vendido), ["#7c3aed","#0ea5e9","#10b981","#f59e0b","#ef4444","#ec4899"]);
        doc.addImage(imgRep, "PNG", ML, y, CW, 58);
        y += 62;
  
        // tabla
        const cols = [55, 28, 25, 25, 28];
        const headers = ["Repuesto", "Categoría", "Uds vendidas", "Pedidos", "Participación"];
        doc.setFillColor(124, 58, 237);
        let cx = ML;
        headers.forEach((h, i) => {
          doc.rect(cx, y, cols[i], 6, "F");
          doc.setTextColor(255, 255, 255); doc.setFont(undefined, "bold"); doc.setFontSize(7.5);
          doc.text(h, cx + 2, y + 4.5);
          cx += cols[i];
        });
        y += 6;
        top10.forEach((r, idx) => {
          y = checkY(y, 7);
          if (idx % 2 === 0) { doc.setFillColor(245, 243, 255); doc.rect(ML, y, CW, 5.5, "F"); }
          cx = ML;
          const participacion = `${((r.pedidos / (resumen?.total || 1)) * 100).toFixed(1)}%`;
          [r.nombre, r.categoria || "—", r.total_vendido, r.pedidos, participacion].forEach((v, i) => {
            doc.setTextColor(30, 41, 59); doc.setFont(undefined, "normal"); doc.setFontSize(8);
            doc.text(String(v).slice(0, 20), cx + 2, y + 4);
            cx += cols[i];
          });
          y += 5.5;
        });
        y += 6;
      }
  
      // ── SECCIÓN 5: TOP CLIENTES ──
      y = checkY(y, 60);
      doc.setFontSize(14); doc.setTextColor(ACENTO_R, ACENTO_G, ACENTO_B); doc.setFont(undefined, "bold");
      doc.text("5. Clientes Más Frecuentes", ML, y); y += 6;
      doc.line(ML, y, ML + CW, y); y += 5;
  
      if (topClientes.length > 0) {
        const top10c = topClientes.slice(0, 10);
        const PALETTE = ["#7c3aed","#0ea5e9","#10b981","#f59e0b","#ef4444","#ec4899"];
        const imgCli = dibujarBarrasH(top10c.map(c => c.nombre), top10c.map(c => c.total_pedidos), PALETTE);
        doc.addImage(imgCli, "PNG", ML, y, CW, 55);
        y += 59;
  
        const cols2 = [70, 35, 30];
        const headers2 = ["Cliente", "Total pedidos", "Participación"];
        doc.setFillColor(16, 185, 129);
        let cx2 = ML;
        headers2.forEach((h, i) => {
          doc.rect(cx2, y, cols2[i], 6, "F");
          doc.setTextColor(255, 255, 255); doc.setFont(undefined, "bold"); doc.setFontSize(7.5);
          doc.text(h, cx2 + 2, y + 4.5); cx2 += cols2[i];
        });
        y += 6;
        top10c.forEach((c, idx) => {
          y = checkY(y, 6);
          if (idx % 2 === 0) { doc.setFillColor(236, 253, 245); doc.rect(ML, y, CW, 5.5, "F"); }
          doc.setTextColor(30, 41, 59); doc.setFont(undefined, "normal"); doc.setFontSize(8);
          doc.text(c.nombre, ML + 2, y + 4);
          doc.text(String(c.total_pedidos), ML + 72, y + 4);
          doc.text(`${((c.total_pedidos / (resumen?.total || 1)) * 100).toFixed(1)}%`, ML + 107, y + 4);
          y += 5.5;
        });
        y += 6;
      }
  
      // ── SECCIÓN 6: INVENTARIO ──
      y = checkY(y, 30);
      nuevaPagina(); y = 20;
      doc.setFontSize(14); doc.setTextColor(ACENTO_R, ACENTO_G, ACENTO_B); doc.setFont(undefined, "bold");
      doc.text("6. Inventario de Stock", ML, y); y += 6;
      doc.line(ML, y, ML + CW, y); y += 5;
  
      if (stock.length > 0) {
        const stockCritico = stock.filter(r => r.stock <= 5);
        const stockBajoArr = stock.filter(r => r.stock > 5 && r.stock <= 10);
        const totalStockVal = stock.reduce((a, b) => a + (b.stock || 0), 0);
  
        // KPIs stock
        const sCards = [
          { label: "Total uds", value: totalStockVal, color: [124, 58, 237] },
          { label: "Crítico", value: stockCritico.length, color: [239, 68, 68] },
          { label: "Bajo", value: stockBajoArr.length, color: [245, 158, 11] },
          { label: "Normal", value: stock.filter(r => r.stock > 10).length, color: [16, 185, 129] },
        ];
        const scardW = CW / 4 - 2;
        sCards.forEach((c, i) => {
          const cx = ML + i * (scardW + 2.5);
          doc.setFillColor(...c.color); doc.roundedRect(cx, y, scardW, 18, 2, 2, "F");
          doc.setFontSize(14); doc.setTextColor(255, 255, 255); doc.setFont(undefined, "bold");
          doc.text(String(c.value), cx + scardW / 2, y + 10, { align: "center" });
          doc.setFontSize(7); doc.setFont(undefined, "normal");
          doc.text(c.label, cx + scardW / 2, y + 16, { align: "center" });
        });
        y += 24;
  
        // gráfico barras stock (top 15)
        const topStock = [...stock].sort((a, b) => b.stock - a.stock).slice(0, 15);
        const stockColors = topStock.map(r => r.stock <= 5 ? "#ef4444" : r.stock <= 10 ? "#f59e0b" : "#10b981");
        const imgStock = dibujarBarrasH(topStock.map(r => r.nombre), topStock.map(r => r.stock), stockColors);
        doc.addImage(imgStock, "PNG", ML, y, CW, 58);
        y += 62;
  
        // alertas críticos
        if (stockCritico.length > 0) {
          doc.setFillColor(255, 247, 237); doc.setDrawColor(249, 115, 22);
          doc.setLineWidth(0.4); doc.roundedRect(ML, y, CW, 8 + stockCritico.length * 5.5, 3, 3, "FD");
          doc.setFontSize(9); doc.setTextColor(249, 115, 22); doc.setFont(undefined, "bold");
          doc.text(`⚠ ${stockCritico.length} repuesto(s) con stock crítico`, ML + 4, y + 6); y += 10;
          stockCritico.forEach(r => {
            doc.setFontSize(8); doc.setTextColor(30, 41, 59); doc.setFont(undefined, "normal");
            doc.text(`• ${r.nombre} — ${r.stock} uds`, ML + 8, y + 4); y += 5.5;
          });
          y += 4;
        }
      }
  
      // ── SECCIÓN 7: USUARIOS ──
      y = checkY(y, 40);
      doc.setFontSize(14); doc.setTextColor(ACENTO_R, ACENTO_G, ACENTO_B); doc.setFont(undefined, "bold");
      doc.text("7. Usuarios del Sistema", ML, y); y += 6;
      doc.line(ML, y, ML + CW, y); y += 5;
  
      if (usuarios.length > 0) {
        const rolesData = [
          { nombre: "Administradores", cantidad: usuarios.filter(u => u.rol === "ADMINISTRADOR").length, color: [124, 58, 237] },
          { nombre: "Operadores",      cantidad: usuarios.filter(u => u.rol === "OPERADOR").length,      color: [14, 165, 233] },
          { nombre: "Clientes",        cantidad: usuarios.filter(u => u.rol === "CLIENTE").length,       color: [16, 185, 129] },
        ].filter(r => r.cantidad > 0);
  
        const imgRoles = dibujarPie(rolesData.map(r => r.nombre), rolesData.map(r => r.cantidad), rolesData.map(r => `rgb(${r.color.join(",")})`), 180);
        doc.addImage(imgRoles, "PNG", ML, y, CW * 0.7, 40);
        y += 44;
  
        rolesData.forEach(r => {
          doc.setFontSize(9); doc.setTextColor(30, 41, 59); doc.setFont(undefined, "normal");
          doc.text(`${r.nombre}: ${r.cantidad}`, ML + 4, y); y += 6;
        });
        doc.text(`Inactivos: ${usuarios.filter(u => u.estado === "INACTIVO").length}`, ML + 4, y); y += 8;
      }
  
      doc.save(`analytics_nissan_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      alert("Error al exportar PDF: " + e.message);
    }
  };

  if (loading) return <div style={s.center}>Cargando analytics globales...</div>;
  if (error)   return <div style={{ ...s.center, color: "#ef4444" }}>{error}</div>;

  const operadores    = usuarios.filter(u => u.rol === "OPERADOR" || u.rol === "ADMINISTRADOR");
  const clientes      = usuarios.filter(u => u.rol === "CLIENTE");
  const stockCritico  = stock.filter(r => r.stock <= 5);
  const stockBajo     = stock.filter(r => r.stock > 5 && r.stock <= 10);
  const totalStock    = stock.reduce((a, b) => a + (b.stock || 0), 0);
  const tasaCancelacion  = resumen?.total > 0 ? ((resumen.cancelados  / resumen.total) * 100).toFixed(1) : "0";
  const tasaFinalizacion = resumen?.total > 0 ? ((resumen.finalizados / resumen.total) * 100).toFixed(1) : "0";
  const usuariosPorRol   = [
    { nombre: "Administradores", cantidad: usuarios.filter(u => u.rol === "ADMINISTRADOR").length, color: "#7c3aed" },
    { nombre: "Operadores",      cantidad: usuarios.filter(u => u.rol === "OPERADOR").length,      color: "#0ea5e9" },
    { nombre: "Clientes",        cantidad: usuarios.filter(u => u.rol === "CLIENTE").length,       color: "#10b981" },
  ].filter(x => x.cantidad > 0);

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Analytics Globales</h1>
          <p style={s.sub}>Métricas completas del sistema · {new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {/* RF9 FIX: botones exportar */}
          <button style={{ ...s.btnBack, background: "#10b981", color: "#fff", border: "none" }} onClick={exportarExcel}>⬇ Excel</button>
          <button style={{ ...s.btnBack, background: "#ef4444", color: "#fff", border: "none" }} onClick={exportarPDF}>⬇ PDF</button>
          <button style={s.btnRefresh} onClick={() => cargar()}>Actualizar</button>
          <button style={s.btnBack}    onClick={() => navigate("/admin")}>← Dashboard</button>
        </div>
      </div>

      {/* RF9 FIX: filtros por rango de fechas */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, padding: "14px 18px", background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Filtrar por fecha:</span>
        <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={s.inputFiltro} placeholder="Desde" />
        <span style={{ color: "#94a3b8" }}>—</span>
        <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={s.inputFiltro} placeholder="Hasta" />
        <button style={{ background: ACENTO, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }} onClick={aplicarFiltros}>Aplicar</button>
        <button style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }} onClick={limpiarFiltros}>Limpiar</button>
      </div>

      {/* Stat cards */}
      <div style={{ marginBottom: 10 }}><div style={s.sectionLabel}>Pedidos</div></div>
      <div style={s.cards}>
        <Card icon="" label="Total pedidos"    value={resumen?.total}        color={ACENTO}   />
        <Card icon="" label="Pendientes"        value={resumen?.pendientes}   color="#f59e0b"  />
        <Card icon="" label="En proceso"        value={resumen?.en_proceso}   color="#3b82f6"  />
        <Card icon="" label="Finalizados"        value={resumen?.finalizados}  color="#10b981"  />
        <Card icon="" label="Cancelados"         value={resumen?.cancelados}   color="#ef4444"  />
        <Card icon="" label="Pedidos hoy"       value={resumen?.pedidos_hoy}  color="#8b5cf6"  sub="Creados hoy" />
      </div>

      {/* KPIs */}
      <div style={{ marginBottom: 10, marginTop: 6 }}><div style={s.sectionLabel}>Rendimiento</div></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Tasa cancelación",   value: `${tasaCancelacion}%`,  color: "#ef4444", icon: "" },
          { label: "Tasa finalización",  value: `${tasaFinalizacion}%`, color: "#10b981", icon: "" },
          { label: "Pedidos activos",    value: (resumen?.pendientes || 0) + (resumen?.en_proceso || 0), color: "#3b82f6", icon: "" },
          { label: "Stock total (uds)",  value: totalStock,             color: ACENTO,    icon: "" },
          { label: "Stock crítico",      value: stockCritico.length,    color: "#f97316", icon: "", sub: "≤ 5 uds" },
        ].map(item => (
          <div key={item.label} style={{ background: `${item.color}0d`, border: `1px solid ${item.color}33`, borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 26 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{item.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: item.color }}>{item.value}</div>
              {item.sub && <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Fila 1: Tendencia + Distribución estados */}
      <div style={s.row2}>
        <ChartPanel title="Tendencia pedidos — período seleccionado">
          {porDia.length === 0 ? <p style={s.empty}>Sin datos</p> : (
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

        <ChartPanel title="Distribución de estados">
          {estados.length === 0 ? <p style={s.empty}>Sin datos</p> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={estados.filter(e => e.cantidad > 0)} dataKey="cantidad" nameKey="nombre_estado" cx="50%" cy="50%" outerRadius={85}
                  label={({ nombre_estado, percent }) => `${nombre_estado} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {estados.map(e => <Cell key={e.nombre_estado} fill={ESTADO_COLOR[e.nombre_estado] || "#6b7280"} />)}
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
        <ChartPanel title="Top 10 repuestos más pedidos">
          {topRep.length === 0 ? <p style={s.empty}>Sin datos</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topRep} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <YAxis type="category" dataKey="nombre" width={115} tick={{ fontSize: 11, fill: "#334155" }} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="total_vendido" fill={ACENTO}  radius={[0, 4, 4, 0]} name="Unidades" />
                <Bar dataKey="pedidos"       fill="#10b981" radius={[0, 4, 4, 0]} name="Pedidos"  />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>

        <ChartPanel title="Clientes más frecuentes">
          {topClientes.length === 0 ? <p style={s.empty}>Sin datos</p> : (
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
        <ChartPanel title="Usuarios del sistema">
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

        <ChartPanel title="Stock por repuesto">
          {stock.length === 0 ? <p style={s.empty}>Sin datos</p> : (
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
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: c }} />{l}
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartPanel>
      </div>

      {/* Alertas stock crítico */}
      {stockCritico.length > 0 && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 14px", color: "#f97316", fontSize: 15, fontWeight: 800 }}>
            ⚠️ {stockCritico.length} repuesto(s) con stock crítico
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {stockCritico.map(r => (
              <div key={r.id_repuesto} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #fed7aa", borderRadius: 20, padding: "6px 14px", fontSize: 13 }}>
                <span style={{ fontWeight: 700 }}>{r.nombre}</span>
                <span style={{ background: r.stock === 0 ? "#ef4444" : "#f97316", color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                  {r.stock} uds
                </span>
              </div>
            ))}
          </div>
          <button style={{ marginTop: 14, background: "#f97316", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }} onClick={() => navigate("/admin/repuestos")}>
            Gestionar repuestos →
          </button>
        </div>
      )}

      <IntegracionExterna />

    </div>
  );
}

// Pegar este componente al final de AdminAnalytics.jsx, antes del último cierre de </div>
// También agregar el import de useRef al inicio: import { useEffect, useState, useRef } from "react";

function IntegracionExterna() {
  const STORAGE_KEY = "nissan_ngrok_url";

  const [url,          setUrl]          = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [inputUrl,     setInputUrl]     = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [datos,        setDatos]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [ultimaSync,   setUltimaSync]   = useState(null);
  const [editando,     setEditando]     = useState(!localStorage.getItem(STORAGE_KEY));

  // Estadísticas combinadas
  const [misPedidos,   setMisPedidos]   = useState([]);

  useEffect(() => {
    fetch("/api/pedidos-externos")
      .then(r => r.json())
      .then(data => setMisPedidos(Array.isArray(data) ? data : []))  // ← garantizar array
      .catch(() => setMisPedidos([]));
  }, []);

  useEffect(() => {
    if (url) cargarDatos(url);
  }, [url]);

  const guardarUrl = () => {
    const limpia = inputUrl.trim().replace(/\/$/, "");
    localStorage.setItem(STORAGE_KEY, limpia);
    setUrl(limpia);
    setEditando(false);
  };

  // REEMPLAZA la función cargarDatos dentro de IntegracionExterna
  // en client/src/pages/admin/AdminAnalytics.jsx
  //
  // CAMBIO: en vez de llamar directo a la URL ngrok (causa CORS),
  // llama a /api/proxy-externo?url=<URL_NGROK>

  const cargarDatos = async (endpoint) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");

      // Usa el proxy del propio backend para evitar CORS
      const proxyUrl = `/api/proxy-externo?url=${encodeURIComponent(endpoint)}`;

      const res = await fetch(proxyUrl, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const json = await res.json();
      setDatos(Array.isArray(json) ? json : []);
      setUltimaSync(new Date());
    } catch (e) {
      setError(`No se pudo conectar: ${e.message}`);
      setDatos([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Métricas combinadas ──
  const totalEllos   = datos.length;
  const totalYo      = misPedidos.length;
  const totalCombinado = totalEllos + totalYo;

  const ingresoEllos = datos.reduce((s, p) => s + (parseFloat(p.total) || 0), 0);
  const ingresoYo    = misPedidos.reduce((s, p) => s + (parseFloat(p.total) || 0), 0);
  const ingresoCombinado = ingresoEllos + ingresoYo;

  // Estados del sistema externo (mapear a los nuestros)
  const contarEstado = (arr, estado) =>
    arr.filter(p => (p.estadoPedido || "").toUpperCase() === estado.toUpperCase()).length;

  const estadosCombinados = [
    { nombre: "Pendientes",  yo: contarEstado(misPedidos, "PENDIENTE"),   ellos: contarEstado(datos, "PENDIENTE") + contarEstado(datos, "EN_PREPARACION"), color: "#f59e0b" },
    { nombre: "En proceso",  yo: contarEstado(misPedidos, "EN PROCESO"),  ellos: contarEstado(datos, "CONFIRMADO"),  color: "#3b82f6" },
    { nombre: "Finalizados", yo: contarEstado(misPedidos, "FINALIZADO"),  ellos: contarEstado(datos, "ENTREGADO") + contarEstado(datos, "FACTURADO"),   color: "#10b981" },
    { nombre: "Cancelados",  yo: contarEstado(misPedidos, "CANCELADO"),   ellos: contarEstado(datos, "CANCELADO"),   color: "#ef4444" },
  ];

  const fmt = n => `$${Number(n).toLocaleString("es-CO")}`;

  const exportarExcelIntegracion = async () => {
    try {
      const XLSX = await import("xlsx");
      const wb   = XLSX.utils.book_new();
      const fecha = new Date().toLocaleString("es-CO");
 
      const headerStyle = {
        fill: { fgColor: { rgb: "10B981" } },
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
        alignment: { horizontal: "center" },
      };
      const headerStyleB = {
        fill: { fgColor: { rgb: "0EA5E9" } },
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
        alignment: { horizontal: "center" },
      };
      const titleStyle = { font: { bold: true, sz: 14, color: { rgb: "0F766E" } } };
 
      // HOJA 1: Resumen combinado
      const totalComb = totalEllos + totalYo;
      const res1 = [
        ["REPORTE INTEGRACIÓN COMBINADA — NISSAN PARTS + SISTEMA EXTERNO", "", "", ""],
        [`Generado: ${fecha}`, "", "", ""],
        ["", "", "", ""],
        ["MÉTRICA",               "NISSAN PARTS", "SISTEMA EXTERNO", "TOTAL COMBINADO"],
        ["Total pedidos",          totalYo,         totalEllos,         totalComb],
        ["Ingresos",               ingresoYo,        ingresoEllos,        ingresoCombinado],
        ["", "", "", ""],
        ["ESTADOS",               "NISSAN PARTS", "SISTEMA EXTERNO", "TOTAL"],
        ...estadosCombinados.map(e => [e.nombre, e.yo, e.ellos, e.yo + e.ellos]),
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(res1);
      ws1["!cols"] = [{ wch: 36 }, { wch: 18 }, { wch: 20 }, { wch: 20 }];
      ws1["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
      ];
      if (ws1.A1) ws1.A1.s = titleStyle;
      XLSX.utils.book_append_sheet(wb, ws1, "📊 Resumen Combinado");
 
      // HOJA 2: Pedidos externos detalle
      if (datos.length) {
        const extData = [
          ["PEDIDOS DEL SISTEMA EXTERNO", "", "", "", ""],
          [`Fuente: ${url}`, "", "", "", ""],
          ["", "", "", "", ""],
          ["# ORDEN", "CLIENTE", "ESTADO", "TOTAL", "FECHA"],
          ...datos.map(p => [
            p.numeroOrden || `#${p.id}`,
            p.clienteNombre || p["cliente Nombre"] || "—",
            p.estadoPedido || "—",
            parseFloat(p.total) || 0,
            p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString("es-CO") : "—",
          ]),
          ["", "", "", "", ""],
          ["TOTAL", "", "", datos.reduce((s, p) => s + (parseFloat(p.total) || 0), 0), ""],
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(extData);
        ws2["!cols"] = [{ wch: 14 }, { wch: 28 }, { wch: 18 }, { wch: 16 }, { wch: 16 }];
        ws2["!merges"] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
        ];
        XLSX.utils.book_append_sheet(wb, ws2, "🔗 Pedidos Externos");
      }
 
      // HOJA 3: Mis pedidos (Nissan Parts)
      if (misPedidos.length) {
        const myData = [
          ["MIS PEDIDOS — NISSAN PARTS", "", "", "", ""],
          [`Total: ${misPedidos.length}`, "", "", "", ""],
          ["", "", "", "", ""],
          ["ID", "ESTADO", "TOTAL", "FECHA", ""],
          ...misPedidos.map(p => [
            p.id_pedido || p.id || "",
            p.estadoPedido || p.estado || "—",
            parseFloat(p.total) || 0,
            p.fechaCreacion || p.fecha_creacion
              ? new Date(p.fechaCreacion || p.fecha_creacion).toLocaleDateString("es-CO")
              : "—",
            "",
          ]),
          ["", "", "", "", ""],
          ["TOTAL", "", misPedidos.reduce((s, p) => s + (parseFloat(p.total) || 0), 0), "", ""],
        ];
        const ws3 = XLSX.utils.aoa_to_sheet(myData);
        ws3["!cols"] = [{ wch: 10 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 8 }];
        ws3["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
        XLSX.utils.book_append_sheet(wb, ws3, "🏪 Pedidos Nissan Parts");
      }
 
      XLSX.writeFile(wb, `integracion_combinada_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (e) {
      alert("Error al exportar Excel: " + e.message);
    }
  };
 
  const exportarPDFIntegracion = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const PW = 210, ML = 16, MR = 16, CW = PW - ML - MR;
      const fecha = new Date().toLocaleString("es-CO");
      let pageNum = 1;
 
      const nuevaPagina = () => {
        doc.addPage(); pageNum++;
        doc.setFontSize(8); doc.setTextColor(148, 163, 184);
        doc.text(`Integración Combinada · Pág. ${pageNum}`, PW / 2, 292, { align: "center" });
      };
      const checkY = (y, needed = 25) => { if (y + needed > 275) { nuevaPagina(); return 20; } return y; };
 
      // helper: barra horizontal simple
      const barH2 = (ctx_labels, values, colorsArr, w = 480, h = 160) => {
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        const maxV = Math.max(...values, 1);
        const bH = 18, gap = 7, lW = 110, pL = 12, pT = 12, pR = 20;
        ctx.fillStyle = "#f8fafc"; ctx.fillRect(0, 0, w, h);
        values.forEach((v, i) => {
          const y = pT + i * (bH + gap);
          const bW = ((v / maxV) * (w - lW - pL - pR));
          ctx.fillStyle = "#334155"; ctx.font = "bold 10px sans-serif"; ctx.textBaseline = "middle";
          const lbl = ctx_labels[i]?.length > 14 ? ctx_labels[i].slice(0, 13) + "…" : ctx_labels[i];
          ctx.fillText(lbl, pL, y + bH / 2);
          ctx.fillStyle = colorsArr[i % colorsArr.length];
          ctx.beginPath(); ctx.roundRect(lW, y, bW, bH, 3); ctx.fill();
          ctx.fillStyle = "#1e293b"; ctx.font = "bold 9px sans-serif";
          ctx.fillText(v, lW + bW + 5, y + bH / 2);
        });
        return canvas.toDataURL("image/png");
      };
 
      // PORTADA
      doc.setFillColor(16, 185, 129); doc.rect(0, 0, PW, 60, "F");
      doc.setFillColor(5, 150, 105);  doc.rect(0, 54, PW, 8, "F");
      doc.setFontSize(22); doc.setTextColor(255, 255, 255); doc.setFont(undefined, "bold");
      doc.text("REPORTE INTEGRACIÓN COMBINADA", PW / 2, 26, { align: "center" });
      doc.setFontSize(12); doc.setFont(undefined, "normal");
      doc.text("Nissan Parts + Sistema Externo", PW / 2, 37, { align: "center" });
      doc.setFontSize(9);
      doc.text(`Generado: ${fecha}`, PW / 2, 48, { align: "center" });
      doc.setFontSize(8); doc.setTextColor(148, 163, 184);
      doc.text("Integración Combinada · Pág. 1", PW / 2, 292, { align: "center" });
 
      let y = 72;
 
      // SECCIÓN 1: KPIs combinados
      doc.setFontSize(14); doc.setTextColor(5, 150, 105); doc.setFont(undefined, "bold");
      doc.text("1. Métricas Combinadas", ML, y); y += 6;
      doc.setDrawColor(16, 185, 129); doc.setLineWidth(0.4); doc.line(ML, y, ML + CW, y); y += 6;
 
      const kCards = [
        { label: "Pedidos combinados", value: totalEllos + totalYo,           color: [124, 58, 237] },
        { label: "Nissan Parts",        value: totalYo,                         color: [14, 165, 233] },
        { label: "Sistema externo",     value: totalEllos,                      color: [16, 185, 129] },
        { label: "Ingreso combinado",   value: `$${ingresoCombinado.toLocaleString("es-CO")}`, color: [245, 158, 11] },
        { label: "Mis ingresos",        value: `$${ingresoYo.toLocaleString("es-CO")}`,        color: [14, 165, 233] },
        { label: "Ingresos externos",   value: `$${ingresoEllos.toLocaleString("es-CO")}`,     color: [16, 185, 129] },
      ];
      const cols = 3, cW2 = CW / cols - 2, cH = 22;
      kCards.forEach((c, i) => {
        const cx = ML + (i % cols) * (cW2 + 3);
        const cy = y + Math.floor(i / cols) * (cH + 4);
        doc.setFillColor(...c.color); doc.roundedRect(cx, cy, cW2, cH, 2, 2, "F");
        doc.setFontSize(i >= 3 ? 9 : 16); doc.setTextColor(255, 255, 255); doc.setFont(undefined, "bold");
        doc.text(String(c.value), cx + cW2 / 2, cy + 12, { align: "center" });
        doc.setFontSize(7); doc.setFont(undefined, "normal");
        doc.text(c.label.toUpperCase(), cx + cW2 / 2, cy + 19, { align: "center" });
      });
      y += 2 * (cH + 4) + 10;
 
      // SECCIÓN 2: Tabla estados comparados
      y = checkY(y, 50);
      doc.setFontSize(13); doc.setTextColor(5, 150, 105); doc.setFont(undefined, "bold");
      doc.text("2. Estados Comparados", ML, y); y += 6;
      doc.line(ML, y, ML + CW, y); y += 5;
 
      // gráfico de barras agrupadas (estimación visual)
      const estLabels = estadosCombinados.map(e => e.nombre);
      const estTotales = estadosCombinados.map(e => e.yo + e.ellos);
      const estColores = estadosCombinados.map(e => e.color);
      const imgEst = barH2(estLabels, estTotales, estColores, 480, 120);
      doc.addImage(imgEst, "PNG", ML, y, CW, 34);
      y += 38;
 
      const cols2 = [48, 35, 38, 30];
      const hdrs2 = ["Estado", "Nissan Parts", "Sistema externo", "Total"];
      let cx2 = ML;
      doc.setFillColor(16, 185, 129);
      hdrs2.forEach((h, i) => {
        doc.rect(cx2, y, cols2[i], 6, "F");
        doc.setTextColor(255, 255, 255); doc.setFont(undefined, "bold"); doc.setFontSize(8);
        doc.text(h, cx2 + 2, y + 4.5); cx2 += cols2[i];
      });
      y += 6;
      estadosCombinados.forEach((e, idx) => {
        y = checkY(y, 6);
        if (idx % 2 === 0) { doc.setFillColor(236, 253, 245); doc.rect(ML, y, CW, 5.5, "F"); }
        cx2 = ML;
        [e.nombre, e.yo, e.ellos, e.yo + e.ellos].forEach((v, i) => {
          doc.setTextColor(30, 41, 59); doc.setFont(undefined, "normal"); doc.setFontSize(8);
          doc.text(String(v), cx2 + 2, y + 4); cx2 += cols2[i];
        });
        y += 5.5;
      });
      y += 8;
 
      // SECCIÓN 3: Últimos pedidos externos
      if (datos.length > 0) {
        y = checkY(y, 30);
        nuevaPagina(); y = 20;
        doc.setFontSize(13); doc.setTextColor(5, 150, 105); doc.setFont(undefined, "bold");
        doc.text("3. Últimos Pedidos del Sistema Externo", ML, y); y += 6;
        doc.line(ML, y, ML + CW, y); y += 5;
 
        const colsP = [32, 52, 30, 30, 30];
        const hdrsP = ["# Orden", "Cliente", "Estado", "Total", "Fecha"];
        let cxP = ML;
        doc.setFillColor(14, 165, 233);
        hdrsP.forEach((h, i) => {
          doc.rect(cxP, y, colsP[i], 6, "F");
          doc.setTextColor(255, 255, 255); doc.setFont(undefined, "bold"); doc.setFontSize(7.5);
          doc.text(h, cxP + 2, y + 4.5); cxP += colsP[i];
        });
        y += 6;
        datos.slice(0, 20).forEach((p, idx) => {
          y = checkY(y, 6);
          if (idx % 2 === 0) { doc.setFillColor(240, 249, 255); doc.rect(ML, y, CW, 5.5, "F"); }
          cxP = ML;
          const orden = String(p.numeroOrden || `#${p.id}`).slice(0, 12);
          const cliente = String(p.clienteNombre || p["cliente Nombre"] || "—").slice(0, 20);
          const estado = String(p.estadoPedido || "—");
          const total = p.total != null ? `$${Number(p.total).toLocaleString("es-CO")}` : "—";
          const fechaP = p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString("es-CO") : "—";
          [orden, cliente, estado, total, fechaP].forEach((v, i) => {
            doc.setTextColor(30, 41, 59); doc.setFont(undefined, "normal"); doc.setFontSize(7.5);
            doc.text(v, cxP + 2, y + 4); cxP += colsP[i];
          });
          y += 5.5;
        });
        if (datos.length > 20) {
          y += 3; doc.setFontSize(7); doc.setTextColor(148, 163, 184);
          doc.text(`... y ${datos.length - 20} pedidos externos más no mostrados`, ML, y); y += 6;
        }
      }
 
      doc.save(`integracion_combinada_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      alert("Error al exportar PDF integración: " + e.message);
    }
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "24px 28px", marginTop: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1e293b" }}>
            🔗 Integración Sistema Externo
          </h3>
          {ultimaSync && (
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
              Última sincronización: {ultimaSync.toLocaleTimeString("es-CO")}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#64748b", padding: "7px 14px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}
            onClick={() => setEditando(true)}
          >
            Cambiar URL
          </button>
          {(datos.length > 0 || misPedidos.length > 0) && (
            <>
              <button
                style={{ background: "#10b981", border: "none", color: "#fff", padding: "7px 13px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 12 }}
                onClick={exportarExcelIntegracion}
                title="Exportar integración a Excel"
              >
                ⬇ Excel
              </button>
              <button
                style={{ background: "#ef4444", border: "none", color: "#fff", padding: "7px 13px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 12 }}
                onClick={exportarPDFIntegracion}
                title="Exportar integración a PDF"
              >
                ⬇ PDF
              </button>
            </>
          )}
          {url && (
            <button
              style={{ background: "#7c3aed", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}
              onClick={() => cargarDatos(url)}
              disabled={loading}
            >
              {loading ? "Sincronizando..." : "Sincronizar"}
            </button>
          )}
        </div>
      </div>

      {/* Configurar URL */}
      {editando && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "#64748b", fontWeight: 600 }}>
            URL del endpoint externo (Ngrok):
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder="https://abc123.ngrok-free.app/api/ordenes"
              style={{ flex: 1, padding: "9px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, color: "#1e293b" }}
              onKeyDown={e => e.key === "Enter" && guardarUrl()}
            />
            <button
              style={{ background: "#7c3aed", border: "none", color: "#fff", padding: "9px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
              onClick={guardarUrl}
            >
              Guardar
            </button>
            {url && (
              <button
                style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#64748b", padding: "9px 14px", borderRadius: 8, cursor: "pointer" }}
                onClick={() => setEditando(false)}
              >
                Cancelar
              </button>
            )}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 11, color: "#94a3b8" }}>
            La URL se guarda en tu navegador. Cámbiala cada vez que Ngrok genere un nuevo link.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#ef4444", fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Sin URL configurada */}
      {!url && !editando && (
        <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔌</div>
          <p style={{ margin: 0, fontSize: 14 }}>Configura la URL del sistema externo para ver las métricas combinadas.</p>
        </div>
      )}

      {/* Métricas combinadas */}
      {(datos.length > 0 || misPedidos.length > 0) && (
        <>
          {/* KPIs combinados */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Pedidos combinados", value: totalCombinado, color: "#7c3aed", icon: "📦" },
              { label: "Nissan Parts",        value: totalYo,        color: "#0ea5e9", icon: "🏪" },
              { label: "Sistema externo",     value: totalEllos,     color: "#10b981", icon: "🔗" },
              { label: "Ingresos combinados", value: fmt(ingresoCombinado), color: "#f59e0b", icon: "💰" },
              { label: "Mis ingresos",        value: fmt(ingresoYo),        color: "#0ea5e9", icon: "📈" },
              { label: "Ingresos externos",   value: fmt(ingresoEllos),     color: "#10b981", icon: "📊" },
            ].map(k => (
              <div key={k.label} style={{ background: `${k.color}10`, border: `1px solid ${k.color}30`, borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{k.icon}</div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: k.color }}>{k.value}</div>
              </div>
            ))}
          </div>

          {/* Tabla de estados comparados */}
          <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#475569" }}>Estados comparados</h4>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={th}>Estado</th>
                  <th style={{ ...th, color: "#0ea5e9" }}>Nissan Parts</th>
                  <th style={{ ...th, color: "#10b981" }}>Sistema externo</th>
                  <th style={th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {estadosCombinados.map(e => (
                  <tr key={e.nombre} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={td}>
                      <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: e.color, marginRight: 8 }} />
                      {e.nombre}
                    </td>
                    <td style={{ ...td, textAlign: "center", fontWeight: 700, color: "#0ea5e9" }}>{e.yo}</td>
                    <td style={{ ...td, textAlign: "center", fontWeight: 700, color: "#10b981" }}>{e.ellos}</td>
                    <td style={{ ...td, textAlign: "center", fontWeight: 800 }}>{e.yo + e.ellos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Últimos pedidos del sistema externo */}
          {datos.length > 0 && (
            <>
              <h4 style={{ margin: "20px 0 12px", fontSize: 14, fontWeight: 700, color: "#475569" }}>
                Últimos pedidos del sistema externo
              </h4>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={th}>Orden</th>
                      <th style={th}>Cliente</th>
                      <th style={th}>Estado</th>
                      <th style={th}>Total</th>
                      <th style={th}>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.slice(0, 10).map((p, i) => (
                      <tr key={p.id || i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={td}>{p.numeroOrden || p.numeroOrden || `#${p.id}`}</td>
                        <td style={td}>{p.clienteNombre || p["cliente Nombre"] || "—"}</td>
                        <td style={td}>
                          <span style={{
                            padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background:
                              p.estadoPedido === "CANCELADO"  ? "#fee2e2" :
                              p.estadoPedido === "CONFIRMADO" ? "#dbeafe" :
                              p.estadoPedido === "ENTREGADO"  ? "#d1fae5" : "#f3f4f6",
                            color:
                              p.estadoPedido === "CANCELADO"  ? "#ef4444" :
                              p.estadoPedido === "CONFIRMADO" ? "#3b82f6" :
                              p.estadoPedido === "ENTREGADO"  ? "#10b981" : "#6b7280",
                          }}>
                            {p.estadoPedido}
                          </span>
                        </td>
                        <td style={td}>{p.total != null ? fmt(p.total) : "—"}</td>
                        <td style={{ ...td, color: "#94a3b8" }}>
                          {p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString("es-CO") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

const th = { padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 };
const td = { padding: "10px 14px", color: "#1e293b" };

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
  inputFiltro:  { padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, background: "#f8fafc", color: "#1e293b" },
};