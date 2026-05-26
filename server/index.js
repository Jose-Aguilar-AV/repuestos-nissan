// server/index.js  ─  Backend corregido RF1–RF10
// ──────────────────────────────────────────────────────────────
require("dotenv").config();

const express = require("express");
const mysql   = require("mysql2");
const cors    = require("cors");
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// RF2 FIX: JWT_SECRET solo desde .env — sin fallback hardcodeado
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  console.error("❌ JWT_SECRET no definido en .env. Abortando.");
  process.exit(1);
}

// ── CONEXIÓN DB ───────────────────────────────────────────────
const db = mysql.createConnection({
  host:     process.env.DB_HOST     || "localhost",
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "sistema_pedidos",
});
db.connect(err => {
  if (err) throw err;
  console.log("✅ MySQL conectado");
});

// ── HELPERS ───────────────────────────────────────────────────
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// ── MIDDLEWARES ───────────────────────────────────────────────
// RF2 FIX: verificarToken valida también que el usuario siga ACTIVO
async function verificarToken(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ error: "Token requerido" });
  try {
    const decoded = jwt.verify(auth.split(" ")[1], SECRET);
    // Validar que el usuario no haya sido desactivado después de emitir el token
    const rows = await query(
      "SELECT id, rol, nombre, estado FROM usuario WHERE id = ?",
      [decoded.id]
    );
    if (!rows.length || rows[0].estado !== "ACTIVO")
      return res.status(401).json({ error: "Usuario inactivo o no encontrado" });
    req.user = { id: rows[0].id, rol: rows[0].rol, nombre: rows[0].nombre };
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}

function soloRol(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (!roles.includes(req.user.rol))
      return res.status(403).json({ error: "Acceso denegado" });
    next();
  };
}
const soloAdmin      = soloRol("ADMINISTRADOR");
const operadorOAdmin = soloRol("OPERADOR", "ADMINISTRADOR");

// Auditoría automática
async function auditar(id_usuario, accion, detalle, ip) {
  try {
    await query(
      "INSERT INTO auditoria (id_usuario, accion, detalle, ip) VALUES (?,?,?,?)",
      [id_usuario, accion, detalle || null, ip || null]
    );
  } catch { /* silencioso */ }
}

// ═══════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════

// LOGIN ─ RF2: bloqueo por intentos fallidos
app.post("/api/login", async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password)
      return res.status(400).json({ error: "Datos incompletos" });

    const rows = await query(
      `SELECT u.*, c.id_cliente
       FROM usuario u
       LEFT JOIN cliente c ON u.id = c.id_usuario
       WHERE u.correo = ?`,
      [correo.trim().toLowerCase()]
    );

    if (!rows.length)
      return res.status(401).json({ error: "Credenciales incorrectas" });

    const user = rows[0];

    // RF2: Verificar si está bloqueado
    if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
      const segundos = Math.ceil((new Date(user.bloqueado_hasta) - new Date()) / 1000);
      return res.status(429).json({
        error: `Cuenta bloqueada. Intenta de nuevo en ${segundos} segundos.`,
      });
    }

    // RF2: Verificar estado ACTIVO
    if (user.estado !== "ACTIVO")
      return res.status(401).json({ error: "Usuario inactivo" });

    const match = await bcrypt.compare(password.trim(), user.contrasena_hash);
    if (!match) {
      // RF2: Incrementar intentos fallidos
      const nuevosIntentos = (user.intentos_fallidos || 0) + 1;
      if (nuevosIntentos >= 3) {
        // Bloquear por 15 minutos
        await query(
          "UPDATE usuario SET intentos_fallidos=?, bloqueado_hasta=DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id=?",
          [nuevosIntentos, user.id]
        );
        return res.status(429).json({
          error: "Demasiados intentos fallidos. Cuenta bloqueada 15 minutos.",
        });
      }
      await query(
        "UPDATE usuario SET intentos_fallidos=? WHERE id=?",
        [nuevosIntentos, user.id]
      );
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Login exitoso → resetear intentos
    await query(
      "UPDATE usuario SET intentos_fallidos=0, bloqueado_hasta=NULL WHERE id=?",
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, rol: user.rol, nombre: user.nombre },
      SECRET,
      { expiresIn: "8h" }
    );

    await auditar(user.id, "LOGIN", null, req.ip);

    res.json({
      token,
      user: {
        id:         user.id,
        id_cliente: user.id_cliente || null,
        nombre:     user.nombre,
        correo:     user.correo,
        rol:        user.rol,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// REGISTRO ─ RF1: agrega celular, valida email y contraseña
app.post("/api/register", async (req, res) => {
  try {
    const { nombre, correo, password, celular } = req.body;

    if (!nombre || !correo || !password)
      return res.status(400).json({ error: "Datos incompletos" });

    // RF1: Validar email con regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.trim()))
      return res.status(400).json({ error: "Formato de correo inválido" });

    // RF1: Validar contraseña mínimo 6 caracteres
    if (password.length < 6)
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });

    const hash = await bcrypt.hash(password, 10);
    const r    = await query(
      "INSERT INTO usuario (nombre, correo, celular, contrasena_hash, rol) VALUES (?,?,?,?,'CLIENTE')",
      [nombre.trim(), correo.toLowerCase().trim(), celular || null, hash]
    );
    await query(
      "INSERT INTO cliente (nombre, id_usuario) VALUES (?,?)",
      [nombre.trim(), r.insertId]
    );
    res.json({ mensaje: "Usuario registrado como cliente" });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Correo ya registrado" });
    res.status(500).json({ error: "Error al registrar" });
  }
});

// ═══════════════════════════════════════════════════════════════
//  USUARIOS  (admin)
// ═══════════════════════════════════════════════════════════════

app.get("/api/usuarios", verificarToken, soloAdmin, async (req, res) => {
  try {
    const rows = await query(
      "SELECT id, nombre, correo, celular, rol, estado, creado_en FROM usuario ORDER BY id DESC"
    );
    res.json(rows);
  } catch (e) { res.status(500).json(e); }
});

app.post("/api/usuarios", verificarToken, soloAdmin, async (req, res) => {
  try {
    const { nombre, correo, contrasena, password, rol = "OPERADOR" } = req.body;
    const pass = contrasena || password;
    if (!nombre || !correo || !pass)
      return res.status(400).json({ error: "Datos incompletos" });
    if (!["OPERADOR", "ADMINISTRADOR", "CLIENTE"].includes(rol))
      return res.status(400).json({ error: "Rol inválido" });
    if (pass.length < 6)
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    const hash = await bcrypt.hash(pass, 10);
    const r    = await query(
      "INSERT INTO usuario (nombre, correo, contrasena_hash, rol) VALUES (?,?,?,?)",
      [nombre, correo.toLowerCase(), hash, rol]
    );
    if (rol === "CLIENTE") {
      await query("INSERT INTO cliente (nombre, id_usuario) VALUES (?,?)", [nombre, r.insertId]);
    }
    await auditar(req.user.id, "CREAR_USUARIO", `Creó ${rol}: ${correo}`, req.ip);
    res.json({ mensaje: "Usuario creado", id: r.insertId });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Correo ya existe" });
    res.status(500).json(e);
  }
});

app.patch("/api/usuarios/:id/estado", verificarToken, soloAdmin, async (req, res) => {
  try {
    const { estado } = req.body;
    if (!["ACTIVO", "INACTIVO"].includes(estado))
      return res.status(400).json({ error: "Estado inválido" });
    await query("UPDATE usuario SET estado=? WHERE id=?", [estado, req.params.id]);
    await auditar(req.user.id, "CAMBIO_ESTADO_USUARIO", `ID ${req.params.id} → ${estado}`, req.ip);
    res.json({ mensaje: `Usuario ${estado}` });
  } catch (e) { res.status(500).json(e); }
});

app.patch("/api/usuarios/:id/rol", verificarToken, soloAdmin, async (req, res) => {
  try {
    const { rol } = req.body;
    if (!["CLIENTE", "OPERADOR", "ADMINISTRADOR"].includes(rol))
      return res.status(400).json({ error: "Rol inválido" });
    await query("UPDATE usuario SET rol=? WHERE id=?", [rol, req.params.id]);
    await auditar(req.user.id, "CAMBIO_ROL", `ID ${req.params.id} → ${rol}`, req.ip);
    res.json({ mensaje: "Rol actualizado" });
  } catch (e) { res.status(500).json(e); }
});

// ═══════════════════════════════════════════════════════════════
//  CLIENTES
// ═══════════════════════════════════════════════════════════════

app.get("/api/clientes", verificarToken, operadorOAdmin, async (req, res) => {
  try {
    const { q } = req.query;
    let sql    = "SELECT c.*, u.correo, u.estado FROM cliente c LEFT JOIN usuario u ON c.id_usuario=u.id";
    const params = [];
    if (q) {
      sql += " WHERE c.nombre LIKE ? OR c.documento LIKE ? OR c.email LIKE ?";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    sql += " ORDER BY c.nombre ASC";
    res.json(await query(sql, params));
  } catch (e) { res.status(500).json(e); }
});

app.post("/api/clientes", verificarToken, operadorOAdmin, async (req, res) => {
  try {
    const { nombre, documento, telefono, email, direccion } = req.body;
    if (!nombre) return res.status(400).json({ error: "Nombre requerido" });
    const r = await query(
      "INSERT INTO cliente (nombre, documento, telefono, email, direccion) VALUES (?,?,?,?,?)",
      [nombre, documento||null, telefono||null, email||null, direccion||null]
    );
    await auditar(req.user.id, "CREAR_CLIENTE", nombre, req.ip);
    res.json({ id_cliente: r.insertId, mensaje: "Cliente creado" });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Documento duplicado" });
    res.status(500).json(e);
  }
});

// ═══════════════════════════════════════════════════════════════
//  REPUESTOS  ─  RF10: POST y DELETE agregados, protegidos soloAdmin
// ═══════════════════════════════════════════════════════════════

app.get("/api/repuestos", async (req, res) => {
  try {
    res.json(await query("SELECT * FROM repuesto ORDER BY nombre ASC"));
  } catch (e) { res.status(500).json(e); }
});

app.get("/api/repuestos/:id", async (req, res) => {
  try {
    const [row] = await query("SELECT * FROM repuesto WHERE id_repuesto=?", [req.params.id]);
    if (!row) return res.status(404).json({ error: "No encontrado" });
    res.json(row);
  } catch (e) { res.status(500).json(e); }
});

// RF10 FIX: POST /api/repuestos — crear repuesto (solo admin)
app.post("/api/repuestos", verificarToken, soloAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, categoria, marca, modelo_compatible, stock, precio, imagen_url } = req.body;
    if (!nombre) return res.status(400).json({ error: "Nombre requerido" });
    const r = await query(
      `INSERT INTO repuesto (nombre, descripcion, categoria, marca, modelo_compatible, stock, precio, imagen_url)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        nombre,
        descripcion || null,
        categoria   || null,
        marca       || null,
        modelo_compatible || null,
        Number(stock)  || 0,
        Number(precio) || 0,
        imagen_url     || null,
      ]
    );
    await auditar(req.user.id, "CREAR_REPUESTO", nombre, req.ip);
    res.status(201).json({ id_repuesto: r.insertId, mensaje: "Repuesto creado" });
  } catch (e) { res.status(500).json(e); }
});

// PUT /api/repuestos/:id — editar repuesto (admin u operador)
app.put("/api/repuestos/:id", verificarToken, operadorOAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, categoria, marca, modelo_compatible, stock, precio, imagen_url } = req.body;
    await query(
      `UPDATE repuesto
       SET nombre=?, descripcion=?, categoria=?, marca=?,
           modelo_compatible=?, stock=?, precio=?, imagen_url=?
       WHERE id_repuesto=?`,
      [nombre, descripcion, categoria, marca, modelo_compatible, stock, precio, imagen_url || null, req.params.id]
    );
    res.json({ mensaje: "Repuesto actualizado" });
  } catch (e) { res.status(500).json(e); }
});

// RF10 FIX: DELETE /api/repuestos/:id — eliminar repuesto (solo admin)
app.delete("/api/repuestos/:id", verificarToken, soloAdmin, async (req, res) => {
  try {
    const [row] = await query("SELECT id_repuesto FROM repuesto WHERE id_repuesto=?", [req.params.id]);
    if (!row) return res.status(404).json({ error: "Repuesto no encontrado" });
    await query("DELETE FROM repuesto WHERE id_repuesto=?", [req.params.id]);
    await auditar(req.user.id, "ELIMINAR_REPUESTO", `ID ${req.params.id}`, req.ip);
    res.json({ mensaje: "Repuesto eliminado" });
  } catch (e) {
    if (e.code === "ER_ROW_IS_REFERENCED_2")
      return res.status(409).json({ error: "No se puede eliminar: el repuesto tiene pedidos asociados" });
    res.status(500).json(e);
  }
});

// ═══════════════════════════════════════════════════════════════
//  PEDIDOS  ─  RF4, RF5
// ═══════════════════════════════════════════════════════════════

// RF4 FIX: guardar precio_unitario en detalle_pedido
// RF5 FIX: evitar duplicados con INSERT ... ON DUPLICATE KEY UPDATE
app.post("/api/pedidos", verificarToken, async (req, res) => {
  try {
    const { id_cliente, detalles, prioridad, observaciones, fecha_entrega_estimada } = req.body;
    const id_usuario = req.user.id;

    if (!id_cliente)
      return res.status(400).json({ error: "id_cliente requerido" });
    if (!detalles?.length)
      return res.status(400).json({ error: "Sin productos" });

    // CLIENTE solo puede crear pedido para sí mismo
    if (req.user.rol === "CLIENTE") {
      const [cli] = await query("SELECT id_usuario FROM cliente WHERE id_cliente=?", [id_cliente]);
      if (!cli || String(cli.id_usuario) !== String(id_usuario))
        return res.status(403).json({ error: "Solo puedes crear pedidos a tu cuenta" });
    }

    const r = await query(
      `INSERT INTO pedido (id_cliente, id_usuario, id_estado, prioridad, observaciones, fecha_entrega_estimada)
       VALUES (?,?,1,?,?,?)`,
      [id_cliente, id_usuario, prioridad||null, observaciones||null, fecha_entrega_estimada||null]
    );
    const idPedido = r.insertId;

    // RF4 FIX: guardar precio_unitario; RF5 FIX: ON DUPLICATE KEY UPDATE cantidad
    for (const d of detalles) {
      const [rep] = await query("SELECT stock, precio FROM repuesto WHERE id_repuesto=?", [d.id_repuesto]);
      if (!rep || rep.stock < d.cantidad)
        return res.status(400).json({ error: `Stock insuficiente: repuesto ${d.id_repuesto}` });

      await query(
        `INSERT INTO detalle_pedido (id_pedido, id_repuesto, cantidad, precio_unitario)
         VALUES (?,?,?,?)
         ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)`,
        [idPedido, d.id_repuesto, d.cantidad, rep.precio]
      );
      await query(
        "UPDATE repuesto SET stock = stock - ? WHERE id_repuesto=?",
        [d.cantidad, d.id_repuesto]
      );
    }

    await query(
      "INSERT INTO historial_estado (id_pedido, id_usuario, id_estado_anterior, id_estado_nuevo) VALUES (?,?,NULL,1)",
      [idPedido, id_usuario]
    );

    await auditar(id_usuario, "CREAR_PEDIDO", `Pedido #${idPedido}`, req.ip);
    res.json({ idPedido, mensaje: "Pedido creado" });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
});

// RF5 FIX: filtro correcto estado/fecha; RF8 FIX: acepta estado, fecha_desde, fecha_hasta
// RF8 FIX: búsqueda por nombre de cliente y por ID de pedido
app.get("/api/pedidos", verificarToken, async (req, res) => {
  try {
    // RF8 FIX: parámetros corregidos: estado (no id_estado), fecha_desde, fecha_hasta
    const { estado, fecha_desde, fecha_hasta, id_cliente, busqueda, limite } = req.query;
    const rol  = req.user.rol;
    const uid  = req.user.id;

    let sql = `
      SELECT p.*, e.nombre_estado,
             c.nombre AS cliente_nombre,
             u.nombre AS usuario_nombre, u.rol AS usuario_rol
      FROM pedido p
      JOIN estado_pedido e ON p.id_estado = e.id_estado
      JOIN cliente c ON p.id_cliente = c.id_cliente
      JOIN usuario u ON p.id_usuario = u.id
      WHERE 1=1`;
    const params = [];

    if (rol === "CLIENTE") {
      sql += " AND p.id_usuario = ?"; params.push(uid);
    } else if (rol === "OPERADOR") {
      sql += " AND p.id_usuario = ?"; params.push(uid);
    }
    // ADMIN ve todos

    // RF8 FIX: usar nombre de campo correcto
    if (estado)       { sql += " AND p.id_estado = ?";              params.push(estado); }
    if (fecha_desde)  { sql += " AND DATE(p.fecha_creacion) >= ?";  params.push(fecha_desde); }
    if (fecha_hasta)  { sql += " AND DATE(p.fecha_creacion) <= ?";  params.push(fecha_hasta); }
    if (id_cliente && rol !== "CLIENTE") { sql += " AND p.id_cliente = ?"; params.push(id_cliente); }

    // RF8 FIX: búsqueda por nombre de cliente o ID de pedido
    if (busqueda) {
      sql += " AND (c.nombre LIKE ? OR CAST(p.id_pedido AS CHAR) LIKE ?)";
      params.push(`%${busqueda}%`, `%${busqueda}%`);
    }

    sql += " ORDER BY p.fecha_creacion DESC";
    if (limite) { sql += " LIMIT ?"; params.push(parseInt(limite)); }

    res.json(await query(sql, params));
  } catch (e) { res.status(500).json(e); }
});

app.get("/api/pedidos/:id", verificarToken, async (req, res) => {
  try {
    const id   = req.params.id;
    const uid  = req.user.id;
    const rol  = req.user.rol;

    const rows = await query(
      `SELECT p.*, e.nombre_estado,
              c.nombre AS cliente_nombre,
              u.nombre AS usuario_nombre,
              d.id_detalle, d.id_repuesto, d.cantidad, d.precio_unitario,
              r.nombre AS repuesto_nombre, r.descripcion AS repuesto_desc, r.stock
       FROM pedido p
       JOIN estado_pedido e  ON p.id_estado    = e.id_estado
       JOIN cliente c        ON p.id_cliente   = c.id_cliente
       JOIN usuario u        ON p.id_usuario   = u.id
       JOIN detalle_pedido d ON p.id_pedido    = d.id_pedido
       JOIN repuesto r       ON d.id_repuesto  = r.id_repuesto
       WHERE p.id_pedido = ?`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: "Pedido no encontrado" });

    const pedido = rows[0];
    if (rol === "CLIENTE" && String(pedido.id_usuario) !== String(uid))
      return res.status(403).json({ error: "No es tu pedido" });
    if (rol === "OPERADOR" && String(pedido.id_usuario) !== String(uid))
      return res.status(403).json({ error: "No es tu pedido" });

    res.json(rows);
  } catch (e) { res.status(500).json(e); }
});

app.put("/api/pedidos/:id/estado", verificarToken, async (req, res) => {
  try {
    const id      = req.params.id;
    const { id_estado } = req.body;
    const uid     = req.user.id;
    const rol     = req.user.rol;

    if (!id_estado) return res.status(400).json({ error: "id_estado requerido" });

    const [pedido] = await query(
      "SELECT id_estado, id_usuario FROM pedido WHERE id_pedido=?", [id]
    );
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });

    const estadoActual = pedido.id_estado;

    if (estadoActual === 4)
      return res.status(400).json({ error: "No se puede cambiar un pedido CANCELADO" });
    if (estadoActual === 3 && id_estado !== 4)
      return res.status(400).json({ error: "Pedido FINALIZADO solo puede cancelarse" });

    if (rol === "CLIENTE")
      return res.status(403).json({ error: "Clientes no pueden cambiar estados" });
    if (rol === "OPERADOR" && String(pedido.id_usuario) !== String(uid))
      return res.status(403).json({ error: "Solo puedes cambiar estados de tus pedidos" });

    await query("UPDATE pedido SET id_estado=? WHERE id_pedido=?", [id_estado, id]);
    await query(
      `INSERT INTO historial_estado (id_pedido, id_usuario, id_estado_anterior, id_estado_nuevo)
       VALUES (?,?,?,?)`,
      [id, uid, estadoActual, id_estado]
    );

    await auditar(uid, "CAMBIO_ESTADO", `Pedido #${id}: ${estadoActual}→${id_estado}`, req.ip);
    res.json({ mensaje: "Estado actualizado" });
  } catch (e) { res.status(500).json(e); }
});

app.put("/api/pedidos/:id", verificarToken, async (req, res) => {
  try {
    const id   = req.params.id;
    const uid  = req.user.id;
    const rol  = req.user.rol;
    const { detalles, prioridad, observaciones } = req.body;

    const [pedido] = await query(
      "SELECT id_estado, id_usuario FROM pedido WHERE id_pedido=?", [id]
    );
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
    if ([3,4].includes(pedido.id_estado))
      return res.status(400).json({ error: "No se puede editar un pedido finalizado o cancelado" });

    if (rol === "CLIENTE" && String(pedido.id_usuario) !== String(uid))
      return res.status(403).json({ error: "No es tu pedido" });
    if (rol === "OPERADOR" && String(pedido.id_usuario) !== String(uid))
      return res.status(403).json({ error: "No es tu pedido" });

    if (detalles?.length) {
      const detallesViejos = await query(
        "SELECT id_repuesto, cantidad FROM detalle_pedido WHERE id_pedido=?", [id]
      );
      for (const d of detallesViejos) {
        await query(
          "UPDATE repuesto SET stock = stock + ? WHERE id_repuesto=?",
          [d.cantidad, d.id_repuesto]
        );
      }

      await query("DELETE FROM detalle_pedido WHERE id_pedido=?", [id]);
      for (const d of detalles) {
        const [rep] = await query("SELECT stock, precio FROM repuesto WHERE id_repuesto=?", [d.id_repuesto]);
        if (!rep || rep.stock < d.cantidad)
          return res.status(400).json({ error: `Stock insuficiente: repuesto ${d.id_repuesto}` });
        await query(
          "INSERT INTO detalle_pedido (id_pedido, id_repuesto, cantidad, precio_unitario) VALUES (?,?,?,?)",
          [id, d.id_repuesto, d.cantidad, rep.precio]
        );
        await query(
          "UPDATE repuesto SET stock = stock - ? WHERE id_repuesto=?",
          [d.cantidad, d.id_repuesto]
        );
      }
    }

    if (prioridad !== undefined || observaciones !== undefined) {
      await query(
        "UPDATE pedido SET prioridad=?, observaciones=? WHERE id_pedido=?",
        [prioridad||null, observaciones||null, id]
      );
    }

    await auditar(uid, "EDITAR_PEDIDO", `Pedido #${id}`, req.ip);
    res.json({ mensaje: "Pedido actualizado" });
  } catch (e) { res.status(500).json(e); }
});

app.put("/api/pedidos/:id/cancelar", verificarToken, async (req, res) => {
  try {
    const id  = req.params.id;
    const uid = req.user.id;
    const rol = req.user.rol;

    const [pedido] = await query(
      "SELECT id_estado, id_usuario FROM pedido WHERE id_pedido=?", [id]
    );
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
    if (pedido.id_estado === 4) return res.status(400).json({ error: "Ya está cancelado" });
    if (pedido.id_estado === 3) return res.status(400).json({ error: "No se puede cancelar un pedido FINALIZADO" });

    if (rol === "CLIENTE" && String(pedido.id_usuario) !== String(uid))
      return res.status(403).json({ error: "No es tu pedido" });
    if (rol === "OPERADOR" && String(pedido.id_usuario) !== String(uid))
      return res.status(403).json({ error: "Solo puedes cancelar tus propios pedidos" });

    const detalles = await query(
      "SELECT id_repuesto, cantidad FROM detalle_pedido WHERE id_pedido=?", [id]
    );
    for (const d of detalles) {
      await query(
        "UPDATE repuesto SET stock = stock + ? WHERE id_repuesto=?",
        [d.cantidad, d.id_repuesto]
      );
    }

    const estadoAnterior = pedido.id_estado;
    await query("UPDATE pedido SET id_estado=4 WHERE id_pedido=?", [id]);
    await query(
      `INSERT INTO historial_estado (id_pedido, id_usuario, id_estado_anterior, id_estado_nuevo)
       VALUES (?,?,?,4)`,
      [id, uid, estadoAnterior]
    );

    await auditar(uid, "CANCELAR_PEDIDO", `Pedido #${id}`, req.ip);
    res.json({ mensaje: "Pedido cancelado y stock restaurado" });
  } catch (e) { res.status(500).json(e); }
});

app.get("/api/pedidos/:id/historial", verificarToken, async (req, res) => {
  try {
    const rows = await query(
      `SELECT h.id_historial,
              ea.nombre_estado AS estado_anterior,
              en.nombre_estado AS estado_nuevo,
              u.nombre AS usuario,
              h.fecha_cambio
       FROM historial_estado h
       LEFT JOIN estado_pedido ea ON h.id_estado_anterior = ea.id_estado
       LEFT JOIN estado_pedido en ON h.id_estado_nuevo    = en.id_estado
       JOIN usuario u ON h.id_usuario = u.id
       WHERE h.id_pedido = ?
       ORDER BY h.fecha_cambio ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json(e); }
});

// RF5 FIX: /api/mis-pedidos usa req.user.id (no parámetro externo)
app.get("/api/mis-pedidos", verificarToken, async (req, res) => {
  try {
    const rows = await query(
      `SELECT p.*, e.nombre_estado, c.nombre AS cliente_nombre
       FROM pedido p
       JOIN estado_pedido e ON p.id_estado = e.id_estado
       JOIN cliente c ON p.id_cliente = c.id_cliente
       WHERE p.id_usuario = ?
       ORDER BY p.fecha_creacion DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json(e); }
});

// ═══════════════════════════════════════════════════════════════
//  ANALYTICS  ─  RF9: filtros por rango de fechas
// ═══════════════════════════════════════════════════════════════

app.get("/api/analytics/resumen", verificarToken, operadorOAdmin, async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    let filtro = "";
    const params = [];
    if (fecha_desde) { filtro += " AND DATE(fecha_creacion) >= ?"; params.push(fecha_desde); }
    if (fecha_hasta) { filtro += " AND DATE(fecha_creacion) <= ?"; params.push(fecha_hasta); }

    const [totales] = await query(
      `SELECT
        COUNT(*) AS total,
        SUM(id_estado=1) AS pendientes,
        SUM(id_estado=2) AS en_proceso,
        SUM(id_estado=3) AS finalizados,
        SUM(id_estado=4) AS cancelados
       FROM pedido WHERE 1=1${filtro}`,
      params
    );
    const [hoy] = await query(
      "SELECT COUNT(*) AS pedidos_hoy FROM pedido WHERE DATE(fecha_creacion)=CURDATE()"
    );
    const [stockBajo] = await query(
      "SELECT COUNT(*) AS repuestos_bajo_stock FROM repuesto WHERE stock <= 5"
    );
    res.json({ ...totales, ...hoy, ...stockBajo });
  } catch (e) { res.status(500).json(e); }
});

app.get("/api/analytics/top-repuestos", verificarToken, operadorOAdmin, async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    let filtro = "";
    const params = [];
    if (fecha_desde) { filtro += " AND DATE(p.fecha_creacion) >= ?"; params.push(fecha_desde); }
    if (fecha_hasta) { filtro += " AND DATE(p.fecha_creacion) <= ?"; params.push(fecha_hasta); }

    const rows = await query(
      `SELECT r.nombre, r.categoria,
              SUM(d.cantidad) AS total_vendido,
              COUNT(DISTINCT d.id_pedido) AS pedidos
       FROM detalle_pedido d
       JOIN repuesto r ON d.id_repuesto = r.id_repuesto
       JOIN pedido p ON d.id_pedido = p.id_pedido
       WHERE p.id_estado != 4${filtro}
       GROUP BY d.id_repuesto
       ORDER BY total_vendido DESC
       LIMIT 10`,
      params
    );
    res.json(rows);
  } catch (e) { res.status(500).json(e); }
});

app.get("/api/analytics/pedidos-por-dia", verificarToken, operadorOAdmin, async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    const desde = fecha_desde || null;
    const hasta = fecha_hasta || null;
    const rows = await query(
      `SELECT DATE(fecha_creacion) AS fecha, COUNT(*) AS cantidad
       FROM pedido
       WHERE (? IS NULL OR DATE(fecha_creacion) >= ?)
         AND (? IS NULL OR DATE(fecha_creacion) <= ?)
       GROUP BY DATE(fecha_creacion)
       ORDER BY fecha ASC`,
      [desde, desde, hasta, hasta]
    );
    res.json(rows);
  } catch (e) { res.status(500).json(e); }
});

app.get("/api/analytics/top-clientes", verificarToken, operadorOAdmin, async (req, res) => {
  try {
    const rows = await query(
      `SELECT c.nombre, COUNT(p.id_pedido) AS total_pedidos
       FROM pedido p
       JOIN cliente c ON p.id_cliente = c.id_cliente
       WHERE p.id_estado != 4
       GROUP BY p.id_cliente
       ORDER BY total_pedidos DESC
       LIMIT 10`
    );
    res.json(rows);
  } catch (e) { res.status(500).json(e); }
});

app.get("/api/analytics/stock", verificarToken, operadorOAdmin, async (req, res) => {
  try {
    const rows = await query(
      "SELECT id_repuesto, nombre, stock, categoria FROM repuesto ORDER BY stock ASC"
    );
    res.json(rows);
  } catch (e) { res.status(500).json(e); }
});

app.get("/api/analytics/estados", verificarToken, operadorOAdmin, async (req, res) => {
  try {
    const rows = await query(
      `SELECT e.nombre_estado, COUNT(p.id_pedido) AS cantidad
       FROM estado_pedido e
       LEFT JOIN pedido p ON e.id_estado = p.id_estado
       GROUP BY e.id_estado`
    );
    res.json(rows);
  } catch (e) { res.status(500).json(e); }
});

// ═══════════════════════════════════════════════════════════════
//  ESTADOS
// ═══════════════════════════════════════════════════════════════
app.get("/api/estados", async (req, res) => {
  try {
    res.json(await query("SELECT * FROM estado_pedido ORDER BY id_estado ASC"));
  } catch (e) { res.status(500).json(e); }
});


// Agregar en server/index.js
// Endpoint público para integración con sistemas externos
// Devuelve pedidos en formato compatible con la API del sistema aliado

app.get("/api/pedidos-externos", (req, res) => {
  const sql = `
    SELECT
      p.id_pedido,
      p.id_estado,
      ep.nombre_estado                          AS estadoPedido,
      u.nombre                                  AS clienteNombre,
      p.fecha_creacion                          AS fechaCreacion,
      p.fecha_actualizacion                     AS fechaActualizacion,
      SUM(d.cantidad * COALESCE(r.precio, 0))   AS total,
      GROUP_CONCAT(
        CONCAT(r.nombre, ' x', d.cantidad)
        ORDER BY r.nombre SEPARATOR ', '
      )                                         AS descripcionItems
    FROM pedido p
    JOIN usuario      u  ON p.id_usuario  = u.id
    JOIN estado_pedido ep ON p.id_estado  = ep.id_estado
    JOIN detalle_pedido d ON p.id_pedido  = d.id_pedido
    JOIN repuesto       r ON d.id_repuesto = r.id_repuesto
    GROUP BY
      p.id_pedido, p.id_estado, ep.nombre_estado,
      u.nombre, p.fecha_creacion, p.fecha_actualizacion
    ORDER BY p.fecha_creacion DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Mapear al formato compatible con el sistema externo
    const resultado = rows.map(p => ({
      id:                 p.id_pedido,
      numeroOrden:        `ORD-NISSAN-${String(p.id_pedido).padStart(4, "0")}`,
      estadoPedido:       p.estadoPedido,
      clienteNombre:      p.clienteNombre,
      descripcionItems:   p.descripcionItems,
      fechaCreacion:      p.fechaCreacion,
      fechaActualizacion: p.fechaActualizacion,
      total:              parseFloat(p.total) || 0,
      sistema:            "Nissan Parts",
    }));

    res.json(resultado);
  });
});

// ═══════════════════════════════════════════════════════════════
//  PROXY EXTERNO — evita CORS al llamar al sistema aliado
//  Agregar en server/index.js ANTES del app.listen(...)
// ═══════════════════════════════════════════════════════════════

// npm install node-fetch   (si usas Node < 18)
// Node 18+ tiene fetch nativo — no necesita instalación

app.get("/api/proxy-externo", async (req, res) => {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: "Parámetro url requerido" });

  // Seguridad mínima: solo permitir https
  if (!url.startsWith("https://")) {
    return res.status(400).json({ error: "Solo se permiten URLs HTTPS" });
  }

  try {
    // Node 18+ fetch nativo
    const response = await fetch(url, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `El servidor externo respondió ${response.status}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: `No se pudo contactar el servidor externo: ${e.message}` });
  }
});




// ══
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend en http://localhost:${PORT}`));