const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "secreto123";

// 🔌 CONEXIÓN DB
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "sistema_pedidos",
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL conectado");
});

// =============================
//  AUTH
// =============================

app.post("/api/login", (req, res) => {
  const correo = req.body.correo.trim();
  const password = req.body.password.trim();

  db.query(
    `SELECT u.*, c.id_cliente
     FROM usuario u
     LEFT JOIN cliente c ON u.id = c.id_usuario
     WHERE u.correo = ?`,
    [correo],
    async (err, result) => {
      if (err) return res.status(500).json({ error: "Error servidor" });

      if (result.length === 0) {
        return res.status(401).json({ error: "Usuario no existe" });
      }

      const user = result[0];
      const match = await bcrypt.compare(password, user.contrasena_hash);

      if (!match) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      const token = jwt.sign({ id: user.id }, SECRET, {
        expiresIn: "1h",
      });

      res.json({
        token,
        user: {
          id: user.id,
          id_cliente: user.id_cliente,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol,
        },
      });
    }
  );
});

app.post("/api/register", async (req, res) => {
  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO usuario (nombre, correo, contrasena_hash) VALUES (?, ?, ?)",
    [nombre, correo, hash],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Correo ya registrado" });
        }
        return res.status(500).json({ error: "Error al registrar" });
      }

      const idUsuario = result.insertId;

      db.query(
        "INSERT INTO cliente (nombre, id_usuario) VALUES (?, ?)",
        [nombre, idUsuario],
        (err2) => {
          if (err2) {
            return res.status(500).json({ error: "Error creando cliente" });
          }

          res.json({ mensaje: "Usuario y cliente creados" });
        }
      );
    }
  );
});

// =============================
//  CATÁLOGO
// =============================

app.get("/api/repuestos", (req, res) => {
  db.query("SELECT * FROM repuesto", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get("/api/repuestos/:id", (req, res) => {
  db.query(
    "SELECT * FROM repuesto WHERE id_repuesto=?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result[0]);
    }
  );
});

// =============================
// PEDIDOS
// =============================

// CREAR PEDIDO
app.post("/api/pedidos", (req, res) => {
  const { id_cliente, id_usuario, detalles } = req.body;

  if (!detalles || detalles.length === 0) {
    return res.status(400).json({ error: "Sin productos" });
  }

  db.query(
    "INSERT INTO pedido (id_cliente, id_usuario, id_estado, fecha_creacion) VALUES (?, ?, ?, NOW())",
    [id_cliente, id_usuario, 1],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error creando pedido" });
      }

      const idPedido = result.insertId;

      const values = detalles.map(d => [
        idPedido,
        d.id_repuesto,
        d.cantidad
      ]);

      db.query(
        "INSERT INTO detalle_pedido (id_pedido, id_repuesto, cantidad) VALUES ?",
        [values],
        (err2) => {
          if (err2) {
            return res.status(500).json({ error: "Error detalles" });
          }

          // DESCONTAR STOCK (CORREGIDO)
          const updates = detalles.map(d =>
            new Promise((resolve, reject) => {
              db.query(
                "UPDATE repuesto SET stock = stock - ? WHERE id_repuesto = ? AND stock >= ?",
                [d.cantidad, d.id_repuesto, d.cantidad],
                (err, result) => {
                  if (err) return reject(err);
                  if (result.affectedRows === 0) {
                    return reject(new Error("Stock insuficiente"));
                  }
                  resolve();
                }
              );
            })
          );

          Promise.all(updates)
            .then(() => {
              res.json({ idPedido });
            })
            .catch(err => {
              res.status(400).json({ error: err.message });
            });

   
        }
      );
    }
  );
});

//  PEDIDOS POR USUARIO
app.get("/api/pedidos/usuario/:id_usuario", (req, res) => {
  const { id_usuario } = req.params;

  db.query(
    `SELECT p.*, e.nombre_estado
     FROM pedido p
     JOIN estado_pedido e ON p.id_estado = e.id_estado
     WHERE p.id_usuario = ?`,
    [id_usuario],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

//  DETALLE DE PEDIDO
app.get("/api/pedidos/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT p.*, d.cantidad, r.nombre, r.descripcion
     FROM pedido p
     JOIN detalle_pedido d ON p.id_pedido = d.id_pedido
     JOIN repuesto r ON d.id_repuesto = r.id_repuesto
     WHERE p.id_pedido = ?`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

//  EDITAR PEDIDO
app.put("/api/pedidos/:id", (req, res) => {
  const { id } = req.params;
  const { detalles } = req.body;

  db.query(
    "DELETE FROM detalle_pedido WHERE id_pedido = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json(err);

      const values = detalles.map(d => [
        id,
        d.id_repuesto,
        d.cantidad
      ]);

      db.query(
        "INSERT INTO detalle_pedido (id_pedido, id_repuesto, cantidad) VALUES ?",
        [values],
        (err2) => {
          if (err2) return res.status(500).json(err2);

          res.json({ mensaje: "Pedido actualizado" });
        }
      );
    }
  );
});

// CANCELAR PEDIDO
app.put("/api/pedidos/:id/cancelar", (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT id_estado FROM pedido WHERE id_pedido = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (!result.length) return res.status(404).json({ error: "No existe" });

      const estado = result[0].id_estado;

      if (estado === 4)
        return res.status(400).json({ error: "Ya está cancelado" });

      if (estado === 3)
        return res.status(400).json({ error: "Finalizado" });

      // 1. recuperar detalles
      db.query(
        "SELECT id_repuesto, cantidad FROM detalle_pedido WHERE id_pedido = ?",
        [id],
        (err2, detalles) => {
          if (err2) return res.status(500).json(err2);

          // 🔥 2. devolver stock
          const updates = detalles.map(d =>
            new Promise((resolve, reject) => {
              db.query(
                "UPDATE repuesto SET stock = stock + ? WHERE id_repuesto = ?",
                [d.cantidad, d.id_repuesto],
                (e) => (e ? reject(e) : resolve())
              );
            })
          );

          Promise.all(updates)
            .then(() => {
              // 🔥 3. cancelar pedido
              db.query(
                "UPDATE pedido SET id_estado = 4 WHERE id_pedido = ?",
                [id],
                (err3) => {
                  if (err3) return res.status(500).json(err3);

                  res.json({ mensaje: "Pedido cancelado y stock restaurado" });
                }
              );
            })
            .catch(err => res.status(500).json(err));
        }
      );
    }
  );
});
// =============================
app.listen(3000, () => {
  console.log("Servidor backend en 3000");
});