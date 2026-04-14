import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [msg, setMsg] = useState("");
  const [modo, setModo] = useState("crear"); // "crear" | "editar"
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    correo: "",
    contrasena: "",
    estado: "ACTIVO",
  });

  // ---------- Helpers ----------
  const limpiarForm = () => {
    setModo("crear");
    setForm({
      id: null,
      nombre: "",
      correo: "",
      contrasena: "",
      estado: "ACTIVO",
    });
  };

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const { data } = await api.get("/api/usuarios");
      setUsuarios(data || []);
    } catch (err) {
      console.error(err);
      setMsg("❌ No se pudieron cargar los usuarios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // ---------- Crear ----------
  const crear = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      setCargando(true);
      await api.post("/api/usuarios", {
        nombre: form.nombre.trim(),
        correo: form.correo.trim().toLowerCase(),
        contrasena: form.contrasena.trim(),
      });
      setMsg("✅ Usuario creado");
      limpiarForm();
      await cargarUsuarios();
    } catch (err) {
      console.error(err);
      const m =
        err?.response?.data?.mensaje ||
        err?.response?.data?.error ||
        "No se pudo crear";
      setMsg(m);
    } finally {
      setCargando(false);
    }
  };

  // ---------- Preparar edición ----------
  const editarClick = (u) => {
    setModo("editar");
    setForm({
      id: u.id,
      nombre: u.nombre,
      correo: u.correo,
      contrasena: "",
      estado: u.estado || "ACTIVO",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------- Guardar edición ----------
  const actualizar = async (e) => {
    e.preventDefault();
    if (!form.id) return;
    setMsg("");
    try {
      setCargando(true);
      await api.put(`/api/usuarios/${form.id}`, {
        nombre: form.nombre.trim(),
        // correo no se cambia; lo dejamos deshabilitado
        contrasena: form.contrasena.trim(), // opcional; si va vacío, el back lo ignora
        estado: form.estado,
      });
      setMsg("✅ Usuario actualizado");
      limpiarForm();
      await cargarUsuarios();
    } catch (err) {
      console.error(err);
      const m =
        err?.response?.data?.mensaje ||
        err?.response?.data?.error ||
        " No se pudo actualizar";
      setMsg(m);
    } finally {
      setCargando(false);
    }
  };

  // ---------- Eliminar ----------
  const eliminar = async (u) => {
    const ok = window.confirm(`¿Eliminar a ${u.nombre}?`);
    if (!ok) return;
    try {
      setCargando(true);
      await api.delete(`/api/usuarios/${u.id}`);
      setMsg(" Usuario eliminado");
      await cargarUsuarios();
    } catch (err) {
      console.error(err);
      setMsg(" No se pudo eliminar");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h2>Usuarios</h2>

      {/* Formulario */}
      <form
        onSubmit={modo === "crear" ? crear : actualizar}
        style={{
          maxWidth: 520,
          padding: 16,
          border: "1px solid #eee",
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          {modo === "crear" ? "Crear usuario" : `Editar usuario #${form.id}`}
        </h3>

        <label>Nombre</label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={onChange}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />

        <label>Correo</label>
        <input
          name="correo"
          type="email"
          value={form.correo}
          disabled={modo === "editar"}
          required
          style={{ width: "100%", marginBottom: 8, background: modo === "editar" ? "#f5f5f5" : undefined }}
        />

        <label>
          Contraseña {modo === "editar" ? "(dejar vacío para NO cambiar)" : ""}
        </label>
        <input
          name="contrasena"
          type="password"
          value={form.contrasena}
          onChange={onChange}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <label>Estado</label>
        <select
          name="estado"
          value={form.estado}
          onChange={onChange}
          style={{ width: "100%", marginBottom: 12 }}
        >
          <option value="ACTIVO">ACTIVO</option>
          <option value="INACTIVO">INACTIVO</option>
        </select>

        <div style={{ display: "flex", gap: 10 }}>
          <button disabled={cargando} type="submit">
            {modo === "crear" ? "Crear" : "Guardar cambios"}
          </button>
          {modo === "editar" && (
            <button
              type="button"
              onClick={limpiarForm}
              style={{ background: "#999", color: "#fff" }}
            >
              Cancelar
            </button>
          )}
        </div>

        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      </form>

      {/* Lista */}
      <div>
        <h3 style={{ marginTop: 0 }}>Lista de usuarios</h3>
        {cargando && <p>Cargando…</p>}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            maxWidth: 900,
          }}
        >
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Nombre</th>
              <th style={th}>Correo</th>
              <th style={th}>Estado</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td style={td}>{u.id}</td>
                <td style={td}>{u.nombre}</td>
                <td style={td}>{u.correo}</td>
                <td style={td}>{u.estado}</td>
                <td style={td}>
                  <button onClick={() => editarClick(u)}>Editar</button>{" "}
                  <button
                    onClick={() => eliminar(u)}
                    style={{ background: "#e74c3c", color: "#fff" }}
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && !cargando && (
              <tr>
                <td style={td} colSpan={5}>
                  Sin usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = { textAlign: "left", borderBottom: "1px solid #eee", padding: 8 };
const td = { borderBottom: "1px solid #f2f2f2", padding: 8 };
