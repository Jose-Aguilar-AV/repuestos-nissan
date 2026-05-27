import { useState } from "react";
import { useCart } from "../store/cart";
import { crearPedido } from "../services/api";

/* ── Toast System ───────────────────────────────────────────── */
function Toast({ toasts, onClose }) {
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 1000, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
      {toasts.map(t => {
        const isError = t.tipo === "error";
        const isWarn  = t.tipo === "warn";
        const bg      = isError ? "#fef2f2" : isWarn ? "#fffbeb" : "#f0fdf4";
        const border  = isError ? "#fca5a5" : isWarn ? "#fcd34d" : "#86efac";
        const color   = isError ? "#991b1b" : isWarn ? "#92400e" : "#166534";
        const icon    = isError ? "❌"       : isWarn ? "⚠️"      : "✅";
        return (
          <div key={t.id} style={{
            background: bg, border: `1px solid ${border}`, borderRadius: 16,
            padding: "14px 18px", minWidth: 260, maxWidth: 360,
            boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
            display: "flex", alignItems: "flex-start", gap: 12,
            animation: "toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            fontFamily: "'Segoe UI', sans-serif",
            pointerEvents: "all",
          }}>
            <span style={{ fontSize: 18, lineHeight: 1.4 }}>{icon}</span>
            <p style={{ flex: 1, margin: 0, color, fontWeight: 600, fontSize: 14, lineHeight: 1.5 }}>{t.msg}</p>
            <button onClick={() => onClose(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 15, padding: 0, lineHeight: 1 }}>✕</button>
          </div>
        );
      })}
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(14px) scale(0.95)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = (msg, tipo = "ok") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, tipo }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };
  const remove = id => setToasts(prev => prev.filter(t => t.id !== id));
  return { toasts, push, remove };
}

/* ── Styles ─────────────────────────────────────────────────── */
const S = {
  page:        { minHeight: "100vh", background: "#f4f6f9", fontFamily: "'Segoe UI', sans-serif", padding: "48px 24px" },
  inner:       { maxWidth: 860, margin: "0 auto" },
  heading:     { fontSize: "clamp(2rem,5vw,2.8rem)", fontWeight: 700, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.02em" },
  accent:      { color: "#c40000" },
  sub:         { color: "#6b7280", margin: 0, fontSize: 15 },
  emptyBox:    { textAlign: "center", padding: "80px 0", background: "#fff", borderRadius: 22, boxShadow: "0 10px 30px rgba(0,0,0,0.06)", border: "1px solid #ececec" },
  emptyIcon:   { fontSize: 56, display: "block", marginBottom: 16 },
  emptyText:   { color: "#9ca3af", fontSize: 17, margin: 0 },
  list:        { display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 },
  card:        { background: "#fff", borderRadius: 18, padding: "18px 22px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #ececec", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", transition: "box-shadow 0.2s" },
  iconBox:     { width: 52, height: 52, background: "#fff5f5", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, border: "1px solid #fecaca" },
  itemName:    { margin: "0 0 3px", fontSize: 15, fontWeight: 600, color: "#111827" },
  itemStock:   { margin: 0, fontSize: 12, color: "#9ca3af" },
  stockNum:    { color: "#6b7280", fontWeight: 600 },
  qtyWrap:     { display: "flex", alignItems: "center", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" },
  qtyBtn:      { width: 36, height: 36, background: "transparent", border: "none", color: "#6b7280", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s, color 0.15s" },
  qtyNum:      { minWidth: 40, textAlign: "center", fontWeight: 700, fontSize: 15, color: "#111827" },
  deleteBtn:   { width: 38, height: 38, borderRadius: 10, border: "1px solid #fecaca", background: "#fff5f5", color: "#c40000", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" },
  footer:      { background: "#fff", borderRadius: 18, padding: "18px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #ececec", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" },
  clearBtn:    { background: "transparent", border: "1px solid #e5e7eb", color: "#9ca3af", padding: "11px 22px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, cursor: "pointer", transition: "all 0.15s" },
  confirmBtn:  (disabled) => ({
    background: disabled ? "#e5e7eb" : "linear-gradient(135deg,#c40000,#ff2a2a)",
    border: "none", color: disabled ? "#9ca3af" : "#fff",
    padding: "13px 32px", borderRadius: 12, fontFamily: "inherit",
    fontSize: 15, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "0 6px 20px rgba(196,0,0,0.25)",
    transition: "all 0.2s",
  }),
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 998 },
  modal:       { background: "#fff", borderRadius: 22, padding: 32, width: 340, boxShadow: "0 24px 64px rgba(0,0,0,0.14)", animation: "popIn 0.2s cubic-bezier(0.34,1.56,0.64,1)" },
  modalTitle:  { margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#111827" },
  modalSub:    { margin: "0 0 18px", fontSize: 13, color: "#6b7280" },
  modalInput:  { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontFamily: "inherit", fontSize: 15, boxSizing: "border-box", outline: "none" },
  modalRow:    { display: "flex", gap: 10, marginTop: 18 },
  cancelBtn:   { flex: 1, padding: 12, borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", fontFamily: "inherit", fontSize: 14, cursor: "pointer" },
  removeBtn:   { flex: 1, padding: 12, borderRadius: 10, border: "1px solid #fecaca", background: "#fff5f5", color: "#c40000", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" },
};

/* ── Component ──────────────────────────────────────────────── */
export default function CrearPedido() {
  const items    = useCart(s => s.items);
  const add      = useCart(s => s.add);
  const decrease = useCart(s => s.decrease);
  const remove   = useCart(s => s.remove);
  const clear    = useCart(s => s.clear);

  const { toasts, push, remove: removeToast } = useToasts();
  const [modal,            setModal]            = useState(null);
  const [cantidadEliminar, setCantidadEliminar] = useState(1);
  const [enviando,         setEnviando]         = useState(false);

  const enviar = async () => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user)              { push("Sesión inválida", "error"); return; }
    if (items.length === 0) { push("Tu carrito está vacío", "warn"); return; }
    const invalido = items.find(i => i.cantidad > i.stock);
    if (invalido)           { push(`Sin stock suficiente: ${invalido.nombre}`, "error"); return; }
    try {
      setEnviando(true);
      const res = await crearPedido({
        id_cliente: user.id_cliente,
        id_usuario: user.id,
        detalles: items.map(i => ({ id_repuesto: i.id_repuesto, cantidad: i.cantidad })),
      });
      push(`Pedido #${res.idPedido} creado exitosamente`);
      clear();
    } catch (e) {
      push(e.message || "Error al crear pedido", "error");
    } finally {
      setEnviando(false);
    }
  };

  const totalUnidades = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
      <div style={S.page}>
        <div style={S.inner}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={S.heading}>Tu <span style={S.accent}>carrito</span></h1>
            {items.length > 0 && (
              <p style={S.sub}>{totalUnidades} unidad{totalUnidades !== 1 ? "es" : ""} · {items.length} producto{items.length !== 1 ? "s" : ""}</p>
            )}
          </div>

          {/* Empty state */}
          {items.length === 0 ? (
            <div style={S.emptyBox}>
              <span style={S.emptyIcon}>🛒</span>
              <p style={S.emptyText}>Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              {/* Item list */}
              <div style={S.list}>
                {items.map(item => {
                  const overStock = item.cantidad > item.stock;
                  return (
                    <div key={item.id_repuesto} style={{
                      ...S.card,
                      border: overStock ? "1px solid #fca5a5" : "1px solid #ececec",
                    }}>
                      <div style={S.iconBox}>🔧</div>

                      <div style={{ flex: 1, minWidth: 130 }}>
                        <h3 style={S.itemName}>{item.nombre}</h3>
                        <p style={S.itemStock}>
                          Stock: <span style={S.stockNum}>{item.stock}</span>
                          {overStock && <span style={{ color: "#c40000", marginLeft: 8, fontSize: 11, fontWeight: 700 }}>⚠ Excede stock</span>}
                        </p>
                      </div>

                      {/* Qty control */}
                      <div style={S.qtyWrap}>
                        <button style={S.qtyBtn} onClick={() => decrease(item.id_repuesto)}>−</button>
                        <span style={S.qtyNum}>{item.cantidad}</span>
                        <button style={S.qtyBtn} onClick={() => {
                          if (item.cantidad >= item.stock) { push(`Sin más stock de "${item.nombre}"`, "warn"); return; }
                          add({ ...item, cantidad: 1 });
                        }}>+</button>
                      </div>

                      <button
                        style={S.deleteBtn}
                        onClick={() => { setModal(item); setCantidadEliminar(1); }}
                        title="Eliminar producto"
                      >✕</button>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div style={S.footer}>
                <button style={S.clearBtn} onClick={() => { clear(); push("Carrito vaciado", "warn"); }}>
                  Vaciar carrito
                </button>
                <button style={S.confirmBtn(enviando)} onClick={enviar} disabled={enviando}>
                  {enviando ? "Procesando..." : "Confirmar pedido →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {modal && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Eliminar producto</h3>
            <p style={S.modalSub}>{modal.nombre} · {modal.cantidad} unidad{modal.cantidad !== 1 ? "es" : ""} en carrito</p>
            <input
              type="number" min="1" max={modal.cantidad}
              value={cantidadEliminar}
              onChange={e => setCantidadEliminar(Math.max(1, Math.min(modal.cantidad, Number(e.target.value))))}
              style={S.modalInput}
            />
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9ca3af" }}>
              {cantidadEliminar >= modal.cantidad ? "Se eliminará el producto del carrito" : `Quedarán ${modal.cantidad - cantidadEliminar} unidades`}
            </p>
            <div style={S.modalRow}>
              <button style={S.cancelBtn} onClick={() => setModal(null)}>Cancelar</button>
              <button style={S.removeBtn} onClick={() => {
                if (cantidadEliminar <= 0) return;
                if (cantidadEliminar >= modal.cantidad) {
                  remove(modal.id_repuesto);
                  push(`"${modal.nombre}" eliminado del carrito`, "warn");
                } else {
                  for (let i = 0; i < cantidadEliminar; i++) decrease(modal.id_repuesto);
                  push(`${cantidadEliminar} unidad${cantidadEliminar !== 1 ? "es" : ""} de "${modal.nombre}" eliminadas`, "warn");
                }
                setModal(null);
              }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} onClose={removeToast} />
    </>
  );
}