// server/index.js  ─  Backend completo con roles y permisos
// ──────────────────────────────────────────────────────────────
const express = require("express");
const mysql   = require("mysql2");
const cors    = require("cors");
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "secreto123";

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
function verificarToken(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ error: "Token requerido" });
  try {
    req.user = jwt.verify(auth.split(" ")[1], SECRET);
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
const soloAdmin    = soloRol("ADMINISTRADOR");
const operadorOAdmin = soloRol("OPERADOR", "ADMINISTRADOR");
const autenticado  = verificarToken;

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

// LOGIN ─ devuelve token con rol incluido
app.post("/api/login", async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password)
      return res.status(400).json({ error: "Datos incompletos" });

    const rows = await query(
      `SELECT u.*, c.id_cliente
       FROM usuario u
       LEFT JOIN cliente c ON u.id = c.id_usuario
       WHERE u.correo = ? AND u.estado = 'ACTIVO'`,
      [correo.trim()]
    );
    if (!rows.length)
      return res.status(401).json({ error: "Usuario no encontrado o inactivo" });

    const user  = rows[0];
    const match = await bcrypt.compare(password.trim(), user.contrasena_hash);
    if (!match)
      return res.status(401).json({ error: "Contraseña incorrecta" });

    // Token incluye rol para validación en frontend
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
        id_cliente: user.id_cliente,
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

// REGISTRO (crea usuario con rol CLIENTE por defecto)
app.post("/api/register", async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;
    if (!nombre || !correo || !password)
      return res.status(400).json({ error: "Datos incompletos" });

    const hash = await bcrypt.hash(password, 10);
    const r    = await query(
      "INSERT INTO usuario (nombre, correo, contrasena_hash, rol) VALUES (?,?,?,'CLIENTE')",
      [nombre, correo.toLowerCase().trim(), hash]
    );
    await query(
      "INSERT INTO cliente (nombre, id_usuario) VALUES (?,?)",
      [nombre, r.insertId]
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

// Listar todos los usuarios
app.get("/api/usuarios", verificarToken, soloAdmin, async (req, res) => {
  try {
    const rows = await query(
      "SELECT id, nombre, correo, rol, estado, creado_en FROM usuario ORDER BY id DESC"
    );
    res.json(rows);
  } catch (e) { res.status(500).json(e); }
});

// Crear operador o admin (solo admin puede)
app.post("/api/usuarios", verificarToken, soloAdmin, async (req, res) => {
  try {
    const { nombre, correo, password, rol = "OPERADOR" } = req.body;
    if (!["OPERADOR", "ADMINISTRADOR", "CLIENTE"].includes(rol))
      return res.status(400).json({ error: "Rol inválido" });
    const hash = await bcrypt.hash(password, 10);
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

// Activar / desactivar usuario
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

// Cambiar rol de usuario (solo admin)
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

// Listar clientes (operador/admin)
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

// Crear cliente (operador/admin crea cliente sin cuenta de sistema)
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
//  REPUESTOS
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

// Actualizar stock / precio (admin u operador)
app.put("/api/repuestos/:id", verificarToken, operadorOAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, categoria, marca, modelo_compatible, stock, precio } = req.body;
    await query(
      `UPDATE repuesto SET nombre=?, descripcion=?, categoria=?, marca=?,
       modelo_compatible=?, stock=?, precio=? WHERE id_repuesto=?`,
      [nombre, descripcion, categoria, marca, modelo_compatible, stock, precio, req.params.id]
    );
    res.json({ mensaje: "Repuesto actualizado" });
  } catch (e) { res.status(500).json(e); }
});

// ═══════════════════════════════════════════════════════════════
//  PEDIDOS  ─  lógica central con permisos por rol
// ═══════════════════════════════════════════════════════════════

// ── Crear pedido ──────────────────────────────────────────────
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

    // Insertar pedido
    const r = await query(
      `INSERT INTO pedido (id_cliente, id_usuario, id_estado, prioridad, observaciones, fecha_entrega_estimada)
       VALUES (?,?,1,?,?,?)`,
      [id_cliente, id_usuario, prioridad||null, observaciones||null, fecha_entrega_estimada||null]
    );
    const idPedido = r.insertId;

    // Insertar detalles y descontar stock
    for (const d of detalles) {
      const [rep] = await query("SELECT stock FROM repuesto WHERE id_repuesto=?", [d.id_repuesto]);
      if (!rep || rep.stock < d.cantidad)
        return res.status(400).json({ error: `Stock insuficiente: repuesto ${d.id_repuesto}` });

      await query(
        "INSERT INTO detalle_pedido (id_pedido, id_repuesto, cantidad) VALUES (?,?,?)",
        [idPedido, d.id_repuesto, d.cantidad]
      );
      await query(
        "UPDATE repuesto SET stock = stock - ? WHERE id_repuesto=?",
        [d.cantidad, d.id_repuesto]
      );
    }

    // Historial inicial NULL → PENDIENTE
    await query(
      "INSERT INTO historial_estado (id_pedido, id_usuario, id_estado_anterior, id_estado_nuevo) VALUES (?,?,NULL,1)",
      [idPedido, id_usuario]
    );

    await auditar(id_usuario, "CREAR_PEDIDO", `Pedido #${idPedido}`, req.ip);
    res.json({ idPedido, mensaje: "Pedido creado" });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
});

// ── Listar pedidos (filtrado por rol) ─────────────────────────
app.get("/api/pedidos", verificarToken, async (req, res) => {
  try {
    const { estado, fecha_desde, fecha_hasta, id_cliente } = req.query;
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

    // Filtro por rol
    if (rol === "CLIENTE") {
      sql += " AND p.id_usuario = ?"; params.push(uid);
    } else if (rol === "OPERADOR") {
      sql += " AND p.id_usuario = ?"; params.push(uid);
    }
    // ADMIN ve todos

    if (estado)       { sql += " AND p.id_estado = ?";         params.push(estado); }
    if (fecha_desde)  { sql += " AND DATE(p.fecha_creacion) >= ?"; params.push(fecha_desde); }
    if (fecha_hasta)  { sql += " AND DATE(p.fecha_creacion) <= ?"; params.push(fecha_hasta); }
    if (id_cliente && rol !== "CLIENTE") { sql += " AND p.id_cliente = ?"; params.push(id_cliente); }

    sql += " ORDER BY p.fecha_creacion DESC";
    res.json(await query(sql, params));
  } catch (e) { res.status(500).json(e); }
});

// ── Detalle de pedido ─────────────────────────────────────────
app.get("/api/pedidos/:id", verificarToken, async (req, res) => {
  try {
    const id   = req.params.id;
    const uid  = req.user.id;
    const rol  = req.user.rol;

    const rows = await query(
      `SELECT p.*, e.nombre_estado,
              c.nombre AS cliente_nombre,
              u.nombre AS usuario_nombre,
              d.id_detalle, d.id_repuesto, d.cantidad,
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

    // Restricción por rol
    const pedido = rows[0];
    if (rol === "CLIENTE" && String(pedido.id_usuario) !== String(uid))
      return res.status(403).json({ error: "No es tu pedido" });
    if (rol === "OPERADOR" && String(pedido.id_usuario) !== String(uid))
      return res.status(403).json({ error: "No es tu pedido" });

    res.json(rows);
  } catch (e) { res.status(500).json(e); }
});

// ── Cambiar estado del pedido ─────────────────────────────────
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

    // Reglas de negocio
    if (estadoActual === 4)
      return res.status(400).json({ error: "No se puede cambiar un pedido CANCELADO" });
    if (estadoActual === 3 && id_estado !== 4)
      return res.status(400).json({ error: "Pedido FINALIZADO solo puede cancelarse" });

    // Permisos por rol
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

// ── Editar pedido ─────────────────────────────────────────────
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

    // Devolver stock anterior
    const detallesViejos = await query(
      "SELECT id_repuesto, cantidad FROM detalle_pedido WHERE id_pedido=?", [id]
    );
    for (const d of detallesViejos) {
      await query(
        "UPDATE repuesto SET stock = stock + ? WHERE id_repuesto=?",
        [d.cantidad, d.id_repuesto]
      );
    }

    // Reemplazar detalles
    await query("DELETE FROM detalle_pedido WHERE id_pedido=?", [id]);
    for (const d of detalles) {
      const [rep] = await query("SELECT stock FROM repuesto WHERE id_repuesto=?", [d.id_repuesto]);
      if (!rep || rep.stock < d.cantidad)
        return res.status(400).json({ error: `Stock insuficiente: repuesto ${d.id_repuesto}` });
      await query(
        "INSERT INTO detalle_pedido (id_pedido, id_repuesto, cantidad) VALUES (?,?,?)",
        [id, d.id_repuesto, d.cantidad]
      );
      await query(
        "UPDATE repuesto SET stock = stock - ? WHERE id_repuesto=?",
        [d.cantidad, d.id_repuesto]
      );
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

// ── Cancelar pedido ───────────────────────────────────────────
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

    // Devolver stock
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

// ── Historial de estados ──────────────────────────────────────
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

// ── Pedidos del usuario autenticado ───────────────────────────
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
//  ANALYTICS
// ═══════════════════════════════════════════════════════════════

// Resumen general (cards dashboard)
app.get("/api/analytics/resumen", verificarToken, operadorOAdmin, async (req, res) => {
  try {
    const [totales]  = await query(
      `SELECT
        COUNT(*) AS total,
        SUM(id_estado=1) AS pendientes,
        SUM(id_estado=2) AS en_proceso,
        SUM(id_estado=3) AS finalizados,
        SUM(id_estado=4) AS cancelados
       FROM pedido`
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

// Repuestos más vendidos
app.get("/api/analytics/top-repuestos", verificarToken, operadorOAdmin, async (req, res) => {
  try {
    const rows = await query(
      `SELECT r.nombre, r.categoria,
              SUM(d.cantidad) AS total_vendido,
              COUNT(DISTINCT d.id_pedido) AS pedidos
       FROM detalle_pedido d
       JOIN repuesto r ON d.id_repuesto = r.id_repuesto
       JOIN pedido p ON d.id_pedido = p.id_pedido
       WHERE p.id_estado != 4
       GROUP BY d.id_repuesto
       ORDER BY total_vendido DESC
       LIMIT 10`
    );
    res.json(rows);
  } catch (e) { res.status(500).json(e); }
});

// Pedidos por día (últimos 30 días)
app.get("/api/analytics/pedidos-por-dia", verificarToken, operadorOAdmin, async (req, res) => {
  try {
    const rows = await query(
      `SELECT DATE(fecha_creacion) AS fecha, COUNT(*) AS cantidad
       FROM pedido
       WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(fecha_creacion)
       ORDER BY fecha ASC`
    );
    res.json(rows);
  } catch (e) { res.status(500).json(e); }
});

// Top clientes
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

// Stock actual
app.get("/api/analytics/stock", verificarToken, operadorOAdmin, async (req, res) => {
  try {
    const rows = await query(
      "SELECT id_repuesto, nombre, stock, categoria FROM repuesto ORDER BY stock ASC"
    );
    res.json(rows);
  } catch (e) { res.status(500).json(e); }
});

// Distribución de estados
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

// ══
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend en http://localhost:${PORT}`));