import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { conectarBD, sequelize } from './database/db.js';

// modelos (se evalúan para asociaciones)
import { Usuario } from './models/Usuario.js';
import { PerfilUsuario } from './models/PerfilUsuario.js';
import { Portafolio } from './models/Portafolio.js';
import { Activo } from './models/Activo.js';
import { Precio } from './models/Precio.js';
import { Transaccion } from './models/Transaccion.js';
import { Contenido } from './models/Contenido.js';

// rutas
import authRoutes from './routes/auth.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Relaciones
Usuario.hasOne(PerfilUsuario, { foreignKey: 'id_usuario' });
PerfilUsuario.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Usuario.hasMany(Portafolio, { foreignKey: 'id_usuario' });
Portafolio.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Activo.hasMany(Precio, { foreignKey: 'id_activo' });
Precio.belongsTo(Activo, { foreignKey: 'id_activo' });

Portafolio.hasMany(Transaccion, { foreignKey: 'id_portafolio' });
Transaccion.belongsTo(Portafolio, { foreignKey: 'id_portafolio' });
Transaccion.belongsTo(Activo, { foreignKey: 'id_activo' });

// Healthcheck
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Rutas públicas
app.use('/api/auth', authRoutes);

// Rutas protegidas
app.use('/api/usuarios', usuariosRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 4000;
const iniciarServidor = async () => {
  try {
    await conectarBD();
    // No alter sync for production safety; confiar en la estructura creada manualmente.
    await sequelize.sync(); // sync without alter
    console.log('Tablas sincronizadas con la BD');
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  }
};

iniciarServidor();

export default app;
