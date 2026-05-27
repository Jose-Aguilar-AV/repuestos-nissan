import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

/* ── Animación de número contador ───────────────────────────── */
function Counter({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); }
      else setVal(start);
    }, 30);
    return () => clearInterval(timer);
  }, [to]);
  return <>{val.toLocaleString()}{suffix}</>;
}

const MODULES = [
  {
    num: "01",
    to: "/repuestos",
    icon: "🔧",
    title: "Gestión de Repuestos",
    text: "Consulta inventario, disponibilidad, referencias y precios de todos los repuestos Nissan en tiempo real.",
    cta: "Ver repuestos",
  },
  {
    num: "02",
    to: "/pedido/nuevo",
    icon: "📋",
    title: "Creación de Pedidos",
    text: "Genera nuevos pedidos de forma rápida y organizada para optimizar el flujo de solicitudes.",
    cta: "Nuevo pedido",
  },
  {
    num: "03",
    to: "/pedidos",
    icon: "📦",
    title: "Seguimiento de Pedidos",
    text: "Visualiza el historial y el estado actual de cada pedido realizado dentro del sistema.",
    cta: "Mis pedidos",
  },
];

const STATS = [
  { label: "Repuestos disponibles", value: 1200, suffix: "+" },
  { label: "Pedidos gestionados",   value: 8400, suffix: "+" },
  { label: "Clientes activos",      value: 320,  suffix: "" },
  { label: "Años de experiencia",   value: 15,   suffix: "" },
];

export default function Home() {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9", fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:none } }
        @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
        @keyframes shimmer  { 0%,100% { opacity:.07 } 50% { opacity:.13 } }
        @keyframes floatA   { 0%,100% { transform:translateY(0) rotate(0deg) } 50% { transform:translateY(-18px) rotate(4deg) } }
        @keyframes floatB   { 0%,100% { transform:translateY(0) rotate(0deg) } 50% { transform:translateY(-12px) rotate(-3deg) } }
        @keyframes pulse    { 0%,100% { box-shadow:0 0 0 0 rgba(196,0,0,.4) } 70% { box-shadow:0 0 0 12px rgba(196,0,0,0) } }
        .module-card:hover  { transform:translateY(-6px) !important; box-shadow:0 20px 48px rgba(0,0,0,.13) !important; }
        .hero-btn-primary:hover  { transform:translateY(-2px); box-shadow:0 12px 28px rgba(196,0,0,.45) !important; }
        .hero-btn-secondary:hover { background:rgba(255,255,255,.18) !important; transform:translateY(-2px); }
      `}</style>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section style={{
        position: "relative", minHeight: 560,
        background: "linear-gradient(135deg, #0d1117 0%, #1a1f2e 55%, #2d0a0a 100%)",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{ position:"absolute", top:-80, right:-80, width:420, height:420, borderRadius:"50%", background:"radial-gradient(circle,rgba(196,0,0,.18),transparent 70%)", animation:"floatA 7s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-60, left:-60, width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,rgba(196,0,0,.12),transparent 70%)", animation:"floatB 9s ease-in-out infinite", pointerEvents:"none" }} />

        {/* Grid pattern overlay */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize:"48px 48px", pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:2, textAlign:"center", color:"#fff", maxWidth:860, padding:"80px 24px", animation:"fadeUp .7s ease both" }}>
          {/* Tag */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(196,0,0,.18)", border:"1px solid rgba(196,0,0,.35)", borderRadius:40, padding:"6px 18px", marginBottom:28, animation:"pulse 2.5s infinite" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#ef4444", display:"inline-block" }} />
            <span style={{ fontSize:12, fontWeight:700, letterSpacing:".08em", color:"#fca5a5" }}>SISTEMA EN LÍNEA</span>
          </div>

          <h1 style={{ fontSize:"clamp(2.4rem,6vw,4rem)", fontWeight:700, margin:"0 0 20px", lineHeight:1.1, letterSpacing:"-0.02em" }}>
            Repuestos <span style={{ color:"#ef4444" }}>Nissan</span><br />
            <span style={{ color:"#9ca3af", fontSize:"0.7em", fontWeight:400 }}>Gestión integral de inventario</span>
          </h1>

          <p style={{ fontSize:"clamp(15px,2vw,18px)", color:"#9ca3af", lineHeight:1.8, marginBottom:40, maxWidth:580, margin:"0 auto 40px" }}>
            Plataforma centralizada para consulta de repuestos, creación de pedidos y seguimiento en tiempo real.
          </p>

          <div style={{ display:"flex", justifyContent:"center", gap:14, flexWrap:"wrap" }}>
            <Link to="/repuestos" className="hero-btn-primary" style={{
              padding:"14px 28px", background:"#c40000", color:"#fff", textDecoration:"none",
              borderRadius:12, fontWeight:700, fontSize:15,
              boxShadow:"0 8px 20px rgba(196,0,0,.35)", transition:"all .2s",
            }}>
              Explorar repuestos →
            </Link>
            <Link to="/pedidos" className="hero-btn-secondary" style={{
              padding:"14px 28px", background:"rgba(255,255,255,.08)", color:"#fff",
              textDecoration:"none", borderRadius:12, fontWeight:600, fontSize:15,
              border:"1px solid rgba(255,255,255,.15)", backdropFilter:"blur(8px)", transition:"all .2s",
            }}>
              Ver pedidos
            </Link>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:80, background:"linear-gradient(transparent,#f4f6f9)", pointerEvents:"none" }} />
      </section>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section style={{ maxWidth:1100, margin:"-32px auto 0", padding:"0 24px", position:"relative", zIndex:3 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              background:"#fff", borderRadius:18, padding:"24px 28px",
              boxShadow:"0 4px 20px rgba(0,0,0,.07)", border:"1px solid #ececec",
              animation:`fadeUp .5s ease ${i * .08}s both`,
            }}>
              <p style={{ margin:"0 0 4px", fontSize:"clamp(1.8rem,3vw,2.2rem)", fontWeight:700, color:"#111827", lineHeight:1 }}>
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p style={{ margin:0, fontSize:13, color:"#9ca3af", fontWeight:500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MÓDULOS ────────────────────────────────────────── */}
      <section style={{ padding:"72px 24px 48px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <p style={{ margin:"0 0 8px", fontSize:12, fontWeight:700, letterSpacing:".1em", color:"#c40000", textTransform:"uppercase" }}>Módulos</p>
          <h2 style={{ fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:700, color:"#111827", margin:"0 0 12px", letterSpacing:"-0.02em" }}>
            Todo lo que necesitas
          </h2>
          <p style={{ color:"#6b7280", fontSize:16, margin:0, maxWidth:480, marginInline:"auto" }}>
            Accede rápidamente a las principales funcionalidades de la plataforma.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))", gap:18 }}>
          {MODULES.map((m, i) => (
            <Link
              key={m.num}
              to={m.to}
              className="module-card"
              style={{
                background:"#fff", borderRadius:22, padding:"32px 28px",
                textDecoration:"none", color:"#111827",
                boxShadow:"0 4px 20px rgba(0,0,0,.07)", border:"1px solid #ececec",
                transition:"transform .25s, box-shadow .25s",
                display:"flex", flexDirection:"column", gap:0,
                animation:`fadeUp .5s ease ${i * .1}s both`,
              }}
            >
              {/* Top row */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                <div style={{ width:52, height:52, borderRadius:14, background:"#fff5f5", border:"1px solid #fecaca", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>
                  {m.icon}
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:"#e5e7eb", letterSpacing:".05em" }}>{m.num}</span>
              </div>

              <h3 style={{ margin:"0 0 10px", fontSize:18, fontWeight:700, color:"#111827" }}>{m.title}</h3>
              <p style={{ margin:"0 0 24px", color:"#6b7280", lineHeight:1.7, fontSize:14, flex:1 }}>{m.text}</p>

              <div style={{ display:"flex", alignItems:"center", gap:6, color:"#c40000", fontSize:13, fontWeight:700 }}>
                {m.cta} <span style={{ fontSize:16 }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── INFO CARDS ─────────────────────────────────────── */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 80px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:18 }}>
        {[
          {
            icon: "⚡",
            title: "Eficiencia y control",
            text: "Centraliza la administración de repuestos y pedidos en una sola plataforma moderna, intuitiva y fácil de usar.",
            color: "#fef9c3", border: "#fde047",
          },
          {
            icon: "🖥️",
            title: "Interfaz moderna",
            text: "Diseñada para ofrecer una experiencia visual limpia, profesional y adaptable a cualquier dispositivo.",
            color: "#eff6ff", border: "#93c5fd",
          },
        ].map((c, i) => (
          <div key={c.title} style={{
            background:"#fff", borderRadius:22, padding:"32px 28px",
            boxShadow:"0 4px 20px rgba(0,0,0,.06)", border:"1px solid #ececec",
            display:"flex", gap:20, alignItems:"flex-start",
            animation:`fadeUp .5s ease ${i * .1 + .2}s both`,
          }}>
            <div style={{ width:52, height:52, borderRadius:14, background:c.color, border:`1px solid ${c.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
              {c.icon}
            </div>
            <div>
              <h3 style={{ margin:"0 0 8px", fontSize:17, fontWeight:700, color:"#111827" }}>{c.title}</h3>
              <p style={{ margin:0, color:"#6b7280", lineHeight:1.7, fontSize:14 }}>{c.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── FOOTER CTA ─────────────────────────────────────── */}
      <section style={{ background:"linear-gradient(135deg,#111827,#1f2937)", padding:"56px 24px", textAlign:"center" }}>
        <h2 style={{ color:"#fff", fontSize:"clamp(1.6rem,3vw,2.2rem)", fontWeight:700, margin:"0 0 12px", letterSpacing:"-0.02em" }}>
          ¿Listo para comenzar?
        </h2>
        <p style={{ color:"#9ca3af", fontSize:16, margin:"0 0 32px" }}>
          Explora el catálogo o crea tu primer pedido ahora mismo.
        </p>
        <div style={{ display:"flex", justifyContent:"center", gap:14, flexWrap:"wrap" }}>
          <Link to="/repuestos" style={{
            padding:"13px 28px", background:"#c40000", color:"#fff", textDecoration:"none",
            borderRadius:12, fontWeight:700, fontSize:15,
            boxShadow:"0 6px 20px rgba(196,0,0,.35)", transition:"all .2s",
          }}>
            Ver catálogo
          </Link>
          <Link to="/pedido/nuevo" style={{
            padding:"13px 28px", background:"rgba(255,255,255,.08)", color:"#fff",
            textDecoration:"none", borderRadius:12, fontWeight:600, fontSize:15,
            border:"1px solid rgba(255,255,255,.15)", transition:"all .2s",
          }}>
            Crear pedido
          </Link>
        </div>
      </section>
    </div>
  );
}