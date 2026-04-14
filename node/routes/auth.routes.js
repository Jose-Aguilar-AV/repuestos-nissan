import { Router } from 'express';
import { login, register } from '../controllers/AuthController.js';

const router = Router();

// Registro
router.post('/register', register);

// Login
router.post('/login', login);

export default router;