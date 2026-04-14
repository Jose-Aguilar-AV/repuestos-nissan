import express from 'express';
import { obtenerUsuarios, obtenerMiUsuario } from '../controllers/UsuarioController.js';
import { auth } from '../middlewares/auth.js';
const router = express.Router();

router.get('/', auth, obtenerUsuarios);
router.get('/me', auth, obtenerMiUsuario);

export default router;
