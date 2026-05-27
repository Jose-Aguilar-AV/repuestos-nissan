// client/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, register as apiRegister } from "../services/api";
import { useAuth } from "../hooks/useAuth";

/* ── Input con focus style ───────────────────────────────────── */
function Field({ label, name, type = "text", placeholder, onChange, onKeyDown }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, letterSpacing: "0.04em" }}>{label}</label>}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 10,
          border: `1.5px solid ${focused ? "#c40000" : "#e5e7eb"}`,
          fontSize: 14, fontFamily: "inherit", boxSizing: "border-box",
          outline: "none", background: "#f9fafb", color: "#111827",
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: focused ? "0 0 0 3px rgba(196,0,0,0.1)" : "none",
        }}
      />
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLogin,  setIsLogin]  = useState(true);
  const [form,     setForm]     = useState({ nombre: "", correo: "", password: "", celular: "" });
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [loading,  setLoading]  = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = () => { setIsLogin(v => !v); setError(""); setSuccess(""); };

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    setLoading(true);
    try {
      if (isLogin) {
        const data = await apiLogin(form.correo, form.password);
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
        setSuccess("Cuenta creada exitosamente. Ya puedes iniciar sesión.");
        setIsLogin(true);
      }
    } catch (e) {
      setError(e.message || "Ocurrió un error, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: "linear-gradient(135deg, #0d1117 0%, #1a1f2e 55%, #2d0a0a 100%)",
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:none } }
        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes shake  { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .submit-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 10px 28px rgba(196,0,0,0.4) !important; }
        .submit-btn:active:not(:disabled){ transform:translateY(0); }
        .switch-link:hover { text-decoration:underline; }
      `}</style>

      {/* Decorative blobs */}
      <div style={{ position:"fixed", top:-100, right:-100, width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(196,0,0,.15),transparent 70%)", animation:"floatA 8s ease-in-out infinite", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:-80, left:-80, width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(196,0,0,.10),transparent 70%)", animation:"floatB 10s ease-in-out infinite", pointerEvents:"none" }} />

      {/* Card centered */}
      <div style={{ margin:"auto", width:"100%", maxWidth:400, padding:"24px 16px", animation:"fadeUp .5s ease" }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"#c40000", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900, color:"#fff" }}>N</div>
            <span style={{ fontSize:22, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>
              Nissan <span style={{ color:"#ef4444" }}>Parts</span>
            </span>
          </div>
          <p style={{ color:"#6b7280", fontSize:13, margin:0 }}>Plataforma de gestión de repuestos</p>
        </div>

        {/* Card */}
        <div style={{
          background:"#fff", borderRadius:22, padding:"32px 28px",
          boxShadow:"0 24px 64px rgba(0,0,0,0.35)",
          animation: error ? "shake 0.4s ease" : "none",
        }}>
          {/* Tabs login / registro */}
          <div style={{ display:"flex", background:"#f3f4f6", borderRadius:12, padding:4, marginBottom:28, gap:4 }}>
            {["login", "registro"].map(tab => {
              const active = (tab === "login") === isLogin;
              return (
                <button key={tab} onClick={() => { setIsLogin(tab === "login"); setError(""); setSuccess(""); }} style={{
                  flex:1, padding:"9px 0", borderRadius:9, border:"none", cursor:"pointer",
                  background: active ? "#fff" : "transparent",
                  color: active ? "#111827" : "#9ca3af",
                  fontFamily:"inherit", fontSize:13, fontWeight: active ? 700 : 500,
                  boxShadow: active ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                  transition:"all 0.2s",
                }}>
                  {tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </button>
              );
            })}
          </div>

          {/* Fields */}
          {!isLogin && (
            <Field label="NOMBRE COMPLETO" name="nombre" placeholder="Juan Pérez" onChange={onChange} />
          )}
          <Field label="CORREO ELECTRÓNICO" name="correo" type="email" placeholder="correo@ejemplo.com" onChange={onChange} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          <Field label="CONTRASEÑA" name="password" type="password" placeholder={isLogin ? "Tu contraseña" : "Mínimo 6 caracteres"} onChange={onChange} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          {!isLogin && (
            <Field label="CELULAR (OPCIONAL)" name="celular" type="tel" placeholder="+57 300 000 0000" onChange={onChange} />
          )}

          {/* Error */}
          {error && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", marginBottom:16, display:"flex", gap:8, alignItems:"flex-start" }}>
              <span style={{ fontSize:15, flexShrink:0 }}>❌</span>
              <p style={{ margin:0, color:"#991b1b", fontSize:13, fontWeight:600, lineHeight:1.5 }}>{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:10, padding:"10px 14px", marginBottom:16, display:"flex", gap:8, alignItems:"flex-start" }}>
              <span style={{ fontSize:15, flexShrink:0 }}>✅</span>
              <p style={{ margin:0, color:"#166534", fontSize:13, fontWeight:600, lineHeight:1.5 }}>{success}</p>
            </div>
          )}

          {/* Submit */}
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width:"100%", padding:"13px 0", borderRadius:12, border:"none",
              background: loading ? "#e5e7eb" : "linear-gradient(135deg,#c40000,#ff2a2a)",
              color: loading ? "#9ca3af" : "#fff",
              fontFamily:"inherit", fontSize:15, fontWeight:700, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 6px 20px rgba(196,0,0,0.28)",
              transition:"all 0.2s", marginTop:4,
            }}
          >
            {loading ? "Cargando..." : isLogin ? "Entrar →" : "Crear cuenta →"}
          </button>

          {/* Switch mode (texto) */}
          <p style={{ textAlign:"center", marginTop:20, fontSize:13, color:"#9ca3af", margin:"20px 0 0" }}>
            {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            <span className="switch-link" onClick={switchMode} style={{ color:"#c40000", fontWeight:700, cursor:"pointer" }}>
              {isLogin ? "Regístrate" : "Inicia sesión"}
            </span>
          </p>
        </div>

        {/* Footer */}
        <p style={{ textAlign:"center", marginTop:24, color:"#374151", fontSize:12 }}>
          © {new Date().getFullYear()} Nissan Parts · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}