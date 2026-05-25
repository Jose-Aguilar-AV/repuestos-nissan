// server/middlewares/auth.js
// RF2 FIX: SECRET sin fallback hardcodeado
const jwt = require("jsonwebtoken");

// SECRET solo desde variable de entorno — sin || "secreto123"
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  console.error("❌ JWT_SECRET no definido en .env");
  process.exit(1);
}

function verificarToken(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token requerido" });
  }
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

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