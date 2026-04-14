const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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

app.get("/api/pedidos/:id_usuario", (req, res) => {
  const { id_usuario } = req.params;

  db.query(
    "SELECT * FROM pedido WHERE id_usuario = ?",
    [id_usuario],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});


// 🔹 CATÁLOGO
app.get("/api/repuestos", (req, res) => {
  db.query("SELECT * FROM repuesto", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});


// 🔹 DETALLE
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


// 🔥 CREAR PEDIDO + VALIDAR STOCK
app.post("/api/pedidos", (req, res) => {
  const { id_cliente, id_usuario, detalles } = req.body;

  if (!detalles || detalles.length === 0) {
    return res.status(400).json({ error: "Sin productos" });
  }

  // 1. Crear pedido
  db.query(
    "INSERT INTO pedido (id_cliente, id_usuario, estadoActual, fechaCreacion) VALUES (?, ?, 'PENDIENTE', NOW())",
    [id_cliente, id_usuario],
    (err, result) => {
      if (err) {
        console.error("Error pedido:", err);
        return res.status(500).json({ error: "Error creando pedido" });
      }

      const idPedido = result.insertId;

      // 2. Insertar detalles
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
            console.error("Error detalles:", err2);
            return res.status(500).json({ error: "Error detalles" });
          }

          // ✅ RESPUESTA CORRECTA
          res.json({ idPedido });
        }
      );
    }
  );
});


// 🔹 LISTAR PEDIDOS
app.get("/api/pedidos", (req, res) => {
  db.query("SELECT * FROM pedido", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.listen(3000, () => console.log("Servidor backend en 3000"));