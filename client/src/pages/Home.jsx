import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={container}>
      
      {/* HERO */}
      <section style={heroSection}>
        <div style={overlay}></div>

        <div style={heroContent}>
          <h1 style={title}>Sistema de Repuestos Nissan</h1>

          <p style={subtitle}>
            Plataforma integral para la gestión de repuestos, pedidos y
            consultas en tiempo real.
          </p>

          <div style={heroButtons}>
            <Link to="/repuestos" style={primaryButton}>
              Explorar Repuestos
            </Link>

            <Link to="/pedido/nuevo" style={secondaryButton}>
              Crear Pedido
            </Link>
          </div>
        </div>
      </section>

      {/* CARDS */}
      <section style={section}>
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>Módulos del Sistema</h2>

          <p style={sectionText}>
            Accede rápidamente a las principales funcionalidades de la
            plataforma.
          </p>
        </div>

        <div style={grid}>
          <Link to="/repuestos" style={card}>
            <div style={iconBox}>01</div>

            <h3 style={cardTitle}>Gestión de Repuestos</h3>

            <p style={cardText}>
              Consulta información detallada de inventario, disponibilidad,
              referencias y precios de los repuestos Nissan.
            </p>
          </Link>

          <Link to="/pedido/nuevo" style={card}>
            <div style={iconBox}>02</div>

            <h3 style={cardTitle}>Creación de Pedidos</h3>

            <p style={cardText}>
              Genera nuevos pedidos de forma rápida y organizada para optimizar
              el flujo de solicitudes.
            </p>
          </Link>

          <Link to="/pedidos" style={card}>
            <div style={iconBox}>03</div>

            <h3 style={cardTitle}>Seguimiento de Pedidos</h3>

            <p style={cardText}>
              Visualiza el historial y el estado actual de cada pedido realizado
              dentro del sistema.
            </p>
          </Link>
        </div>
      </section>

      {/* INFO */}
      <section style={infoSection}>
        <div style={infoCard}>
          <h3 style={infoTitle}>Eficiencia y Control</h3>

          <p style={infoText}>
            Centraliza la administración de repuestos y pedidos en una sola
            plataforma moderna, intuitiva y fácil de usar.
          </p>
        </div>

        <div style={infoCard}>
          <h3 style={infoTitle}>Interfaz Moderna</h3>

          <p style={infoText}>
            Diseñada para ofrecer una experiencia visual limpia, profesional y
            adaptable a cualquier dispositivo.
          </p>
        </div>
      </section>

    </div>
  );
}

/* =========================
   ESTILOS
========================= */

const container = {
  minHeight: "100vh",
  background: "#f4f6f9",
  fontFamily: "'Segoe UI', sans-serif",
};

/* HERO */

const heroSection = {
  position: "relative",
  height: "500px",
  background:
    "linear-gradient(135deg, #111827 0%, #1f2937 50%, #c40000 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const overlay = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
};

const heroContent = {
  position: "relative",
  zIndex: 2,
  textAlign: "center",
  color: "white",
  maxWidth: "850px",
  padding: "0 20px",
};

const title = {
  fontSize: "56px",
  fontWeight: "700",
  marginBottom: "20px",
  letterSpacing: "1px",
};

const subtitle = {
  fontSize: "20px",
  color: "#e5e7eb",
  lineHeight: "1.7",
  marginBottom: "35px",
};

const heroButtons = {
  display: "flex",
  justifyContent: "center",
  gap: "18px",
  flexWrap: "wrap",
};

const primaryButton = {
  padding: "15px 28px",
  background: "#c40000",
  color: "white",
  textDecoration: "none",
  borderRadius: "12px",
  fontWeight: "600",
  boxShadow: "0 8px 20px rgba(196,0,0,0.35)",
  transition: "0.3s",
};

const secondaryButton = {
  padding: "15px 28px",
  background: "rgba(255,255,255,0.1)",
  color: "white",
  textDecoration: "none",
  borderRadius: "12px",
  fontWeight: "600",
  border: "1px solid rgba(255,255,255,0.2)",
  backdropFilter: "blur(6px)",
  transition: "0.3s",
};

/* SECTION */

const section = {
  padding: "80px 40px",
};

const sectionHeader = {
  textAlign: "center",
  marginBottom: "50px",
};

const sectionTitle = {
  fontSize: "38px",
  color: "#111827",
  marginBottom: "15px",
};

const sectionText = {
  fontSize: "17px",
  color: "#6b7280",
};

/* GRID */

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "30px",
  maxWidth: "1200px",
  margin: "auto",
};

const card = {
  background: "white",
  padding: "35px",
  borderRadius: "22px",
  textDecoration: "none",
  color: "#111827",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  transition: "0.3s",
  border: "1px solid #ececec",
};

const iconBox = {
  width: "60px",
  height: "60px",
  borderRadius: "16px",
  background: "#c40000",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
  fontSize: "18px",
  marginBottom: "25px",
};

const cardTitle = {
  fontSize: "24px",
  marginBottom: "15px",
  color: "#111827",
};

const cardText = {
  color: "#6b7280",
  lineHeight: "1.8",
  fontSize: "15px",
};

/* INFO */

const infoSection = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "25px",
  padding: "0 40px 80px",
  maxWidth: "1200px",
  margin: "auto",
};

const infoCard = {
  background: "white",
  borderRadius: "22px",
  padding: "35px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  borderLeft: "6px solid #c40000",
};

const infoTitle = {
  fontSize: "24px",
  marginBottom: "15px",
  color: "#111827",
};

const infoText = {
  color: "#6b7280",
  lineHeight: "1.8",
  fontSize: "15px",
};