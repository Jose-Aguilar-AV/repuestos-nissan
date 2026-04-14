import { useState } from "react";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const login = async () => {
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, contrasena }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/";
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>🔐 Login</h2>

      <input
        placeholder="Correo"
        onChange={e => setCorreo(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Contraseña"
        onChange={e => setContrasena(e.target.value)}
      />

      <br /><br />

      <button onClick={login}>Ingresar</button>
    </div>
  );
}