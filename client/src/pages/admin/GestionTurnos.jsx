// client/src/pages/admin/GestionTurnos.jsx
import { useEffect, useState } from "react";

const API = (path, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...opts.headers },
    ...opts,
  }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Error");
    return data;
  });
};

const TURNO_COLOR = { MAÑANA: "#f59e0b", TARDE: "#3b82f6", NOCHE: "#7c3aed" };

export default function GestionTurnos() {
  const [turnos,     setTurnos]     = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [saving,     setSaving]     = useState(null);  // id_turno en curso
  const [ok,         setOk]         = useState(null);  // id_turno con éxito
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true); setError("");
      const [t, o] = await Promise.all([
        API("/turnos"),
        API("/turnos/operadores"),
      ]);
      setTurnos(t);
      setOperadores(o);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (id, field, value) =>
    setTurnos(prev => prev.map(t => t.id_turno === id ? { ...t, [field]: value } : t));

  const guardar = async (turno) => {
    setSaving(turno.id_turno);
    try {
      const updated = await API(`/turnos/${turno.id_turno}`, {
        method: "PUT",
        body: JSON.stringify({
          id_operador: turno.id_operador || null,
          hora_inicio: turno.hora_inicio,
          hora_fin:    turno.hora_fin,
          activo:      turno.activo,
        }),
      });
      setTurnos(prev => prev.map(t => t.id_turno === updated.id_turno ? { ...t, ...updated } : t));
      setOk(turno.id_turno);
      setTimeout(() => setOk(null), 2000);
    } catch (e) {
      alert("Error al guardar: " + e.message);
    } finally {
      setSaving(null);
    }
  };

  // Determina cuál turno está activo AHORA
  const ahora = new Date();
  const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
  const toMin = (t) => {
    if (!t) return 0;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const turnoActivo = turnos.find(t =>
    t.activo && horaActual >= toMin(t.hora_inicio) && horaActual < toMin(t.hora_fin)
  );

  if (loading) return <div style={s.center}>Cargando turnos...</div>;
  if (error)   return <div style={{ ...s.center, color: "#ef4444" }}>{error}</div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>⏰ Gestión de Turnos</h2>
          <p style={s.sub}>
            Configura qué operador atiende cada turno. Los pedidos creados en el
            horario de un turno se asignan automáticamente al operador de ese turno.
          </p>
        </div>
        <button style={s.btnRefresh} onClick={cargar}>↺ Actualizar</button>
      </div>

      {/* Banner turno activo ahora */}
      {turnoActivo && (
        <div style={s.banner}>
          <span style={{ fontSize: 20 }}>🟢</span>
          <div>
            <strong>Turno activo ahora: {turnoActivo.nombre_turno}</strong>
            {" · "}
            {turnoActivo.hora_inicio?.slice(0, 5)} – {turnoActivo.hora_fin?.slice(0, 5)}
            {turnoActivo.nombre_operador
              ? <> · Operador: <strong>{turnoActivo.nombre_operador}</strong></>
              : <span style={{ color: "#ef4444" }}> · ⚠ Sin operador asignado</span>
            }
          </div>
        </div>
      )}

      {/* Tarjetas de turnos */}
      <div style={s.grid}>
        {turnos.map(t => {
          const color  = TURNO_COLOR[t.nombre_turno] || "#64748b";
          const activo = turnoActivo?.id_turno === t.id_turno;
          return (
            <div key={t.id_turno} style={{ ...s.card, borderTop: `4px solid ${color}`, opacity: t.activo ? 1 : 0.55 }}>
              {/* Cabecera */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ ...s.badge, background: color }}>{t.nombre_turno}</span>
                  {activo && <span style={s.activoChip}>EN CURSO</span>}
                </div>
                <label style={s.switchLabel}>
                  <input type="checkbox" checked={t.activo} onChange={e => update(t.id_turno, "activo", e.target.checked)} style={{ marginRight: 6 }} />
                  {t.activo ? "Activo" : "Inactivo"}
                </label>
              </div>

              {/* Horas */}
              <div style={s.row}>
                <div style={s.field}>
                  <label style={s.label}>Hora inicio</label>
                  <input
                    type="time"
                    value={t.hora_inicio?.slice(0, 5) || ""}
                    onChange={e => update(t.id_turno, "hora_inicio", e.target.value + ":00")}
                    style={s.input}
                  />
                </div>
                <div style={{ ...s.field, color: "#94a3b8", fontSize: 20, paddingTop: 22 }}>→</div>
                <div style={s.field}>
                  <label style={s.label}>Hora fin</label>
                  <input
                    type="time"
                    value={t.hora_fin?.slice(0, 5) || ""}
                    onChange={e => update(t.id_turno, "hora_fin", e.target.value + ":00")}
                    style={s.input}
                  />
                </div>
              </div>

              {/* Operador */}
              <div style={{ ...s.field, marginTop: 12 }}>
                <label style={s.label}>Operador asignado</label>
                <select
                  value={t.id_operador || ""}
                  onChange={e => update(t.id_turno, "id_operador", e.target.value ? Number(e.target.value) : null)}
                  style={s.select}
                >
                  <option value="">⚠ Sin asignar</option>
                  {operadores.map(o => (
                    <option key={o.id_usuario} value={o.id_usuario}>{o.nombre}</option>
                  ))}
                </select>
                {!t.id_operador && (
                  <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 0" }}>
                    Los pedidos de este turno quedarán sin operador hasta que asignes uno.
                  </p>
                )}
              </div>

              {/* Botón guardar */}
              <button
                style={{ ...s.btnGuardar, background: ok === t.id_turno ? "#10b981" : color }}
                onClick={() => guardar(t)}
                disabled={saving === t.id_turno}
              >
                {saving === t.id_turno ? "Guardando..." : ok === t.id_turno ? "✓ Guardado" : "Guardar cambios"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Nota informativa */}
      <div style={s.nota}>
        <strong>¿Cómo funciona?</strong> Cuando un cliente (o un operador actuando como cliente)
        crea un pedido, el sistema detecta la hora actual y lo asigna automáticamente al operador
        del turno correspondiente. El administrador puede reasignar cualquier pedido manualmente
        desde el detalle del pedido.
      </div>
    </div>
  );
}

const s = {
  page:        { padding: "28px 32px", maxWidth: 900, margin: "auto" },
  center:      { textAlign: "center", padding: 60, color: "#64748b" },
  header:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 16, flexWrap: "wrap" },
  title:       { margin: 0, fontSize: "1.5rem", color: "#1e293b", fontWeight: 900 },
  sub:         { margin: "6px 0 0", color: "#64748b", fontSize: 13, maxWidth: 560 },
  btnRefresh:  { background: "#7c3aed", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 9, fontWeight: 700, cursor: "pointer" },
  banner:      { display: "flex", alignItems: "center", gap: 12, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "12px 18px", marginBottom: 24, fontSize: 14, color: "#166534" },
  grid:        { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 24 },
  card:        { background: "#fff", borderRadius: 14, padding: "22px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0" },
  badge:       { color: "#fff", fontWeight: 800, fontSize: 12, padding: "4px 12px", borderRadius: 20, letterSpacing: 0.5 },
  activoChip:  { background: "#dcfce7", color: "#16a34a", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, letterSpacing: 0.5 },
  switchLabel: { fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", cursor: "pointer" },
  row:         { display: "flex", gap: 10, alignItems: "flex-end" },
  field:       { display: "flex", flexDirection: "column", flex: 1 },
  label:       { fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 5 },
  input:       { padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, background: "#f8fafc", color: "#1e293b" },
  select:      { padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, background: "#f8fafc", color: "#1e293b" },
  btnGuardar:  { marginTop: 18, width: "100%", color: "#fff", border: "none", padding: "10px 0", borderRadius: 9, fontWeight: 700, cursor: "pointer", fontSize: 14, transition: "background 0.3s" },
  nota:        { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: "#64748b" },
};