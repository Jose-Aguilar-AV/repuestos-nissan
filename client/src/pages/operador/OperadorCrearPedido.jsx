// pages/operador/OperadorCrearPedido.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getClientes,
  crearCliente,
  getRepuestos,
  crearPedido,
} from "../../services/api";

export default function OperadorCrearPedido() {
  const navigate = useNavigate();

  // ── Paso actual
  const [paso, setPaso] = useState(1); // 1=cliente, 2=repuestos, 3=confirmar

  // ── Cliente
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clientes, setClientes]               = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [modoNuevoCliente, setModoNuevoCliente] = useState(false);
  const [formCliente, setFormCliente] = useState({ nombre: "", documento: "", telefono: "", email: "", direccion: "" });
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [errorCliente, setErrorCliente]     = useState("");

  // ── Repuestos
  const [repuestos, setRepuestos]       = useState([]);
  const [buscaRep, setBuscaRep]         = useState("");
  const [carrito, setCarrito]           = useState([]);
  const [loadingRep, setLoadingRep]     = useState(false);

  // ── Pedido
  const [observaciones, setObservaciones] = useState("");
  const [prioridad, setPrioridad]         = useState("");
  const [enviando, setEnviando]           = useState(false);
  const [errorPedido, setErrorPedido]     = useState("");

  useEffect(() => {
    getRepuestos().then(setRepuestos).catch(() => {});
  }, []);

  // ── Buscar clientes
  const buscarClientes = async () => {
    if (!busquedaCliente.trim()) return;
    try {
      setLoadingCliente(true);
      const data = await getClientes(busquedaCliente);
      setClientes(data || []);
    } catch { setClientes([]); }
    finally { setLoadingCliente(false); }
  };

  // ── Crear cliente nuevo
  const guardarNuevoCliente = async () => {
    if (!formCliente.nombre.trim()) {
      setErrorCliente("El nombre es obligatorio");
      return;
    }
    try {
      setLoadingCliente(true);
      setErrorCliente("");
      const data = await crearCliente(formCliente);
      setClienteSeleccionado({ id_cliente: data.id_cliente, nombre: formCliente.nombre });
      setModoNuevoCliente(false);
      setPaso(2);
    } catch (e) {
      setErrorCliente(e.message || "Error al crear cliente");
    } finally {
      setLoadingCliente(false);
    }
  };

  // ── Carrito
  const agregarACarrito = (rep) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id_repuesto === rep.id_repuesto);
      if (existe) return prev.map(i => i.id_repuesto === rep.id_repuesto
        ? { ...i, cantidad: Math.min(i.cantidad + 1, rep.stock) } : i);
      return [...prev, { ...rep, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, val) => {
    const n = parseInt(val);
    if (isNaN(n) || n < 1) return;
    setCarrito(prev => prev.map(i => i.id_repuesto === id
      ? { ...i, cantidad: Math.min(n, i.stock) } : i));
  };

  const quitarDelCarrito = (id) => setCarrito(prev => prev.filter(i => i.id_repuesto !== id));

  // ── Enviar pedido
  const enviarPedido = async () => {
    if (!clienteSeleccionado) return;
    if (carrito.length === 0) { setErrorPedido("Agrega al menos un repuesto"); return; }
    try {
      setEnviando(true);
      setErrorPedido("");
      const data = await crearPedido({
        id_cliente: clienteSeleccionado.id_cliente,
        detalles: carrito.map(i => ({ id_repuesto: i.id_repuesto, cantidad: i.cantidad })),
        observaciones: observaciones || null,
        prioridad: prioridad || null,
      });
      alert(`✅ Pedido #${data.idPedido} creado exitosamente`);
      navigate("/operador/pedidos");
    } catch (e) {
      setErrorPedido(e.message || "Error al crear pedido");
    } finally {
      setEnviando(false);
    }
  };

  const repFiltrados = repuestos.filter(r =>
    !buscaRep || r.nombre.toLowerCase().includes(buscaRep.toLowerCase())
  );

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <h1 style={s.title}>➕ Crear Pedido</h1>
        <button style={s.btnBack} onClick={() => navigate("/operador/pedidos")}>← Volver</button>
      </div>

      {/* Stepper */}
      <div style={s.stepper}>
        {[{ n: 1, label: "Cliente" }, { n: 2, label: "Repuestos" }, { n: 3, label: "Confirmar" }].map(st => (
          <div key={st.n} style={s.stepItem}>
            <div style={{ ...s.stepCircle, background: paso >= st.n ? "#0ea5e9" : "#e2e8f0", color: paso >= st.n ? "#fff" : "#94a3b8" }}>
              {st.n}
            </div>
            <span style={{ ...s.stepLabel, color: paso >= st.n ? "#0ea5e9" : "#94a3b8" }}>{st.label}</span>
          </div>
        ))}
      </div>

      {/* ═══ PASO 1: CLIENTE ═══ */}
      {paso === 1 && (
        <div style={s.card}>
          <h2 style={s.cardTitle}>Seleccionar cliente</h2>

          {clienteSeleccionado && (
            <div style={s.selectedBox}>
              ✅ Cliente seleccionado: <strong>{clienteSeleccionado.nombre}</strong>
              <button style={s.btnSmallGray} onClick={() => setClienteSeleccionado(null)}>Cambiar</button>
            </div>
          )}

          {!clienteSeleccionado && (
            <>
              <div style={s.searchRow}>
                <input
                  placeholder="Buscar por nombre, documento o email..."
                  value={busquedaCliente}
                  onChange={e => setBusquedaCliente(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && buscarClientes()}
                  style={s.input}
                />
                <button style={s.btnPrimary} onClick={buscarClientes}>Buscar</button>
                <button style={s.btnSecondary} onClick={() => { setModoNuevoCliente(true); setClientes([]); }}>+ Nuevo cliente</button>
              </div>

              {loadingCliente && <p style={{ color: "#94a3b8" }}>Buscando...</p>}

              {clientes.length > 0 && (
                <div style={s.clienteList}>
                  {clientes.map(c => (
                    <div key={c.id_cliente} style={s.clienteItem}>
                      <div>
                        <strong>{c.nombre}</strong>
                        {c.documento && <span style={s.chip}>{c.documento}</span>}
                        {c.telefono && <span style={{ color: "#64748b", fontSize: 13, marginLeft: 8 }}>{c.telefono}</span>}
                      </div>
                      <button style={s.btnPrimary} onClick={() => { setClienteSeleccionado(c); setClientes([]); }}>
                        Seleccionar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {modoNuevoCliente && (
                <div style={s.nuevoClienteBox}>
                  <h3 style={{ color: "#0ea5e9", marginTop: 0 }}>Nuevo cliente</h3>
                  {errorCliente && <div style={s.errorBox}>{errorCliente}</div>}
                  {[
                    { name: "nombre",    label: "Nombre *",    type: "text" },
                    { name: "documento", label: "Documento",   type: "text" },
                    { name: "telefono",  label: "Teléfono",    type: "text" },
                    { name: "email",     label: "Email",       type: "email" },
                    { name: "direccion", label: "Dirección",   type: "text" },
                  ].map(f => (
                    <div key={f.name} style={{ marginBottom: 10 }}>
                      <label style={s.label}>{f.label}</label>
                      <input
                        type={f.type}
                        value={formCliente[f.name]}
                        onChange={e => setFormCliente(p => ({ ...p, [f.name]: e.target.value }))}
                        style={s.input}
                      />
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={s.btnPrimary} onClick={guardarNuevoCliente} disabled={loadingCliente}>
                      {loadingCliente ? "Guardando..." : "Crear cliente"}
                    </button>
                    <button style={s.btnSecondary} onClick={() => setModoNuevoCliente(false)}>Cancelar</button>
                  </div>
                </div>
              )}
            </>
          )}

          {clienteSeleccionado && (
            <button style={{ ...s.btnPrimary, marginTop: 20 }} onClick={() => setPaso(2)}>
              Siguiente → Repuestos
            </button>
          )}
        </div>
      )}

      {/* ═══ PASO 2: REPUESTOS ═══ */}
      {paso === 2 && (
        <div style={s.card}>
          <h2 style={s.cardTitle}>Seleccionar repuestos</h2>
          <p style={{ color: "#64748b", marginBottom: 16 }}>Cliente: <strong>{clienteSeleccionado?.nombre}</strong></p>

          <input
            placeholder="Buscar repuesto..."
            value={buscaRep}
            onChange={e => setBuscaRep(e.target.value)}
            style={{ ...s.input, marginBottom: 16, maxWidth: 340 }}
          />

          {loadingRep && <p style={{ color: "#94a3b8" }}>Cargando repuestos...</p>}

          <div style={s.repGrid}>
            {repFiltrados.map(r => {
              const enCarrito = carrito.find(i => i.id_repuesto === r.id_repuesto);
              return (
                <div key={r.id_repuesto} style={{ ...s.repCard, border: enCarrito ? "2px solid #0ea5e9" : "1px solid #e2e8f0" }}>
                  <div style={s.repIcon}>🔧</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{r.nombre}</div>
                    {r.descripcion && <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{r.descripcion}</div>}
                    <div style={{ fontSize: 13 }}>
                      Stock: <strong style={{ color: r.stock > 5 ? "#10b981" : r.stock > 0 ? "#f59e0b" : "#ef4444" }}>{r.stock}</strong>
                      {r.precio > 0 && <span style={{ marginLeft: 12, color: "#64748b" }}>${Number(r.precio).toLocaleString("es-CO")}</span>}
                    </div>
                  </div>
                  {r.stock > 0 ? (
                    <button style={s.btnAdd} onClick={() => agregarACarrito(r)}>
                      {enCarrito ? `+1 (${enCarrito.cantidad})` : "Agregar"}
                    </button>
                  ) : (
                    <span style={s.sinStock}>Sin stock</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resumen carrito */}
          {carrito.length > 0 && (
            <div style={s.carritoBox}>
              <h3 style={{ color: "#0ea5e9", marginTop: 0 }}>🛒 Carrito ({carrito.length} producto(s))</h3>
              {carrito.map(i => (
                <div key={i.id_repuesto} style={s.carritoItem}>
                  <span style={{ flex: 1, fontWeight: 600 }}>{i.nombre}</span>
                  <input
                    type="number"
                    min={1}
                    max={i.stock}
                    value={i.cantidad}
                    onChange={e => cambiarCantidad(i.id_repuesto, e.target.value)}
                    style={{ ...s.input, width: 70, textAlign: "center", padding: "6px 8px" }}
                  />
                  <span style={{ color: "#94a3b8", fontSize: 12, marginLeft: 6 }}>/ {i.stock} disp.</span>
                  <button style={s.btnRemove} onClick={() => quitarDelCarrito(i.id_repuesto)}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button style={s.btnSecondary} onClick={() => setPaso(1)}>← Volver</button>
            <button
              style={{ ...s.btnPrimary, opacity: carrito.length === 0 ? 0.5 : 1 }}
              onClick={() => carrito.length > 0 && setPaso(3)}
              disabled={carrito.length === 0}
            >
              Siguiente → Confirmar
            </button>
          </div>
        </div>
      )}

      {/* ═══ PASO 3: CONFIRMAR ═══ */}
      {paso === 3 && (
        <div style={s.card}>
          <h2 style={s.cardTitle}>Confirmar pedido</h2>

          <div style={s.resumenBox}>
            <div style={s.resumenFila}><span style={s.resLabel}>Cliente:</span> <strong>{clienteSeleccionado?.nombre}</strong></div>
            <div style={s.resumenFila}><span style={s.resLabel}>Productos:</span> <strong>{carrito.length}</strong></div>
            {carrito.map(i => (
              <div key={i.id_repuesto} style={{ ...s.resumenFila, paddingLeft: 16, fontSize: 14, color: "#64748b" }}>
                {i.nombre} × {i.cantidad}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, marginBottom: 14 }}>
            <label style={s.label}>Prioridad</label>
            <select value={prioridad} onChange={e => setPrioridad(e.target.value)} style={{ ...s.input, maxWidth: 220 }}>
              <option value="">Sin prioridad</option>
              <option value="ALTA">ALTA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="BAJA">BAJA</option>
            </select>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={s.label}>Observaciones</label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              rows={3}
              placeholder="Notas adicionales..."
              style={{ ...s.input, resize: "vertical" }}
            />
          </div>

          {errorPedido && <div style={s.errorBox}>{errorPedido}</div>}

          <div style={{ display: "flex", gap: 10 }}>
            <button style={s.btnSecondary} onClick={() => setPaso(2)}>← Volver</button>
            <button style={{ ...s.btnPrimary, flex: 1 }} onClick={enviarPedido} disabled={enviando}>
              {enviando ? "Creando pedido..." : "✅ Crear pedido"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:           { padding: "30px 36px", maxWidth: 900, margin: "auto" },
  header:         { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title:          { margin: 0, fontSize: "1.8rem", color: "#0ea5e9", fontWeight: 800 },
  btnBack:        { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", padding: "8px 18px", borderRadius: 8, fontWeight: 600, cursor: "pointer" },
  stepper:        { display: "flex", gap: 0, marginBottom: 28, justifyContent: "center" },
  stepItem:       { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 100 },
  stepCircle:     { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 },
  stepLabel:      { fontSize: 13, fontWeight: 600 },
  card:           { background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0" },
  cardTitle:      { margin: "0 0 18px", color: "#1e293b", fontSize: "1.2rem", fontWeight: 800 },
  selectedBox:    { display: "flex", alignItems: "center", gap: 14, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "12px 18px", marginBottom: 16, color: "#0369a1" },
  searchRow:      { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  input:          { padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "#f8fafc", color: "#1e293b", width: "100%", boxSizing: "border-box" },
  btnPrimary:     { background: "#0ea5e9", color: "#fff", border: "none", padding: "9px 22px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14, whiteSpace: "nowrap" },
  btnSecondary:   { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", padding: "9px 18px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 },
  btnSmallGray:   { background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, marginLeft: 12 },
  clienteList:    { display: "flex", flexDirection: "column", gap: 8, marginTop: 12 },
  clienteItem:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc" },
  chip:           { background: "#e0f2fe", color: "#0369a1", borderRadius: 20, padding: "2px 10px", fontSize: 12, marginLeft: 10, fontWeight: 600 },
  nuevoClienteBox:{ marginTop: 16, padding: "20px 22px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" },
  label:          { display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 5 },
  repGrid:        { display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, overflowY: "auto", marginBottom: 16 },
  repCard:        { display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 10, background: "#f8fafc", transition: "border .15s" },
  repIcon:        { width: 44, height: 44, background: "#e0f2fe", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  btnAdd:         { background: "#0ea5e9", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" },
  sinStock:       { fontSize: 12, color: "#ef4444", fontWeight: 700 },
  carritoBox:     { background: "#f0f9ff", borderRadius: 12, padding: "16px 20px", border: "1px solid #bae6fd" },
  carritoItem:    { display: "flex", alignItems: "center", gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #e0f2fe" },
  btnRemove:      { background: "#fee2e2", color: "#ef4444", border: "none", width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 14, flexShrink: 0 },
  resumenBox:     { background: "#f8fafc", borderRadius: 12, padding: "16px 20px", border: "1px solid #e2e8f0" },
  resumenFila:    { padding: "6px 0", borderBottom: "1px solid #f1f5f9", color: "#334155" },
  resLabel:       { color: "#94a3b8", fontSize: 13, marginRight: 8 },
  errorBox:       { background: "#fef2f2", color: "#ef4444", padding: "10px 16px", borderRadius: 8, marginBottom: 14 },
};