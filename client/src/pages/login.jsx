import { useState } from "react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    const url = isLogin
      ? "http://localhost:3000/api/login"
      : "http://localhost:3000/api/register";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error");
        return;
      }

      // 🔥 LOGIN
      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "/";
      } else {
        alert("Cuenta creada, ahora inicia sesión");
        setIsLogin(true);
      }

    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>
          {isLogin ? "Iniciar sesión" : "Crear cuenta"}
        </h2>

        {!isLogin && (
          <input
            name="nombre"
            placeholder="Nombre"
            onChange={handleChange}
            style={input}
          />
        )}

        <input
          name="correo"
          placeholder="Correo"
          onChange={handleChange}
          style={input}
        />

        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          onChange={handleChange}
          style={input}
        />

        <button onClick={handleSubmit} style={btn}>
          {isLogin ? "Entrar" : "Registrarse"}
        </button>

        <p style={switchText}>
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
          <span
            style={link}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? " Crear una" : " Iniciar sesión"}
          </span>
        </p>
      </div>
    </div>
  );
}

/* 🎨 ESTILOS */

const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #111, #c40000)",
};

const card = {
  background: "#fff",
  padding: 30,
  borderRadius: 12,
  width: 320,
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  textAlign: "center",
};

const title = {
  marginBottom: 20,
  color: "#c40000",
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 12,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const btn = {
  width: "100%",
  padding: 10,
  background: "#c40000",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: "bold",
};

const switchText = {
  marginTop: 15,
  fontSize: 14,
};

const link = {
  color: "#c40000",
  cursor: "pointer",
  fontWeight: "bold",
};