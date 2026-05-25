// client/src/pages/login.jsx
// RF1 FIX: agrega campo celular al formulario de registro
// RF2 FIX: usa login() del AuthContext para actualización reactiva
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, register as apiRegister } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ nombre: "", correo: "", password: "", celular: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const data = await apiLogin(form.correo, form.password);
        // RF2 FIX: usar login() del context para reactividad
        login(data.user, data.token);

        const rol = data.user?.rol;
        if      (rol === "ADMINISTRADOR") navigate("/admin");
        else if (rol === "OPERADOR")      navigate("/operador");
        else                              navigate("/mis-pedidos");
      } else {
        await apiRegister({
          nombre:   form.nombre,
          correo:   form.correo,
          password: form.password,
          celular:  form.celular || undefined,
        });
        setError("✅ Cuenta creada. Ahora inicia sesión.");
        setIsLogin(true);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.logoBox}>
          <span style={s.logoRed}>Nissan</span>
          <span style={s.logoGray}> Parts</span>
        </div>

        <h2 style={s.title}>{isLogin ? "Iniciar sesión" : "Crear cuenta"}</h2>

        {!isLogin && (
          <input
            name="nombre"
            placeholder="Nombre completo"
            onChange={onChange}
            style={s.input}
          />
        )}
        <input
          name="correo"
          type="email"
          placeholder="Correo electrónico"
          onChange={onChange}
          style={s.input}
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña (mín. 6 caracteres)"
          onChange={onChange}
          style={s.input}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {/* RF1 FIX: campo celular solo en registro */}
        {!isLogin && (
          <input
            name="celular"
            type="tel"
            placeholder="Celular (opcional)"
            onChange={onChange}
            style={s.input}
          />
        )}

        {error && (
          <div style={{
            ...s.alert,
            background: error.startsWith("✅") ? "#d1fae5" : "#fee2e2",
            color:      error.startsWith("✅") ? "#065f46" : "#991b1b",
          }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} style={s.btn} disabled={loading}>
          {loading ? "Cargando..." : isLogin ? "Entrar" : "Registrarme"}
        </button>

        <p style={s.switch}>
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
          <span style={s.switchLink} onClick={() => { setIsLogin(!isLogin); setError(""); }}>
            {isLogin ? " Crear una" : " Iniciar sesión"}
          </span>
        </p>
      </div>
    </div>
  );
}

const s = {
  container: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", background: "linear-gradient(135deg, #0f172a, #1e293b)",
  },
  card: {
    background: "#fff", padding: "36px 32px", borderRadius: 16,
    width: 340, boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
  },
  logoBox:    { textAlign: "center", fontSize: 26, fontWeight: 900, marginBottom: 6, letterSpacing: 1 },
  logoRed:    { color: "#c40000" },
  logoGray:   { color: "#333" },
  title:      { textAlign: "center", marginBottom: 22, color: "#1f2937", fontSize: 18, fontWeight: 600 },
  input:      { width: "100%", padding: "10px 12px", marginBottom: 12, borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" },
  btn:        { width: "100%", padding: 12, background: "#c40000", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 15, marginTop: 4 },
  alert:      { padding: "8px 12px", borderRadius: 8, marginBottom: 12, fontSize: 13 },
  switch:     { textAlign: "center", marginTop: 16, fontSize: 13, color: "#6b7280" },
  switchLink: { color: "#c40000", cursor: "pointer", fontWeight: 700 },
};