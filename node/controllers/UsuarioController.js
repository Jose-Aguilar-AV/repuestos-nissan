import { Usuario } from '../models/Usuario.js';
import { PerfilUsuario } from '../models/PerfilUsuario.js';
import bcrypt from 'bcrypt';

export const obtenerUsuarios = async (_req, res) => {
  try {
    const usuarios = await Usuario.findAll({ include: [{ model: PerfilUsuario, required: false }], order: [['id','ASC']] });
    return res.json(usuarios);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

export const obtenerMiUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id, { attributes: { exclude: ['contrasena_hash'] } });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    return res.json(usuario);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
};
