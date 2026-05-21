// server/middlewares/auth.js
// ─────────────────────────────────────────────────────────────
// Middleware JWT + control de roles
// ─────────────────────────────────────────────────────────────
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "secreto123";

// ── Verifica token JWT ──────────────────────────────────────
function verificarToken(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token requerido" });
  }
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // { id, rol, nombre }
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// ── Fábrica de middleware de rol ────────────────────────────
function soloRol(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: "Acceso denegado para tu rol" });
    }
    next();
  };
}

const soloAdmin      = soloRol("ADMINISTRADOR");
const soloOperador   = soloRol("OPERADOR", "ADMINISTRADOR");
const soloCliente    = soloRol("CLIENTE");
const operadorOAdmin = soloRol("OPERADOR", "ADMINISTRADOR");

module.exports = {
  verificarToken,
  soloAdmin,
  soloOperador,
  soloCliente,
  operadorOAdmin,
  soloRol,
};