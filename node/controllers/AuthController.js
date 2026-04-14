import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/Usuario.js';

export const register = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }
    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) return res.status(400).json({ mensaje: "El correo ya está registrado" });
    const hash = await bcrypt.hash(contrasena, 10);
    const usuario = await Usuario.create({ nombre, correo, contrasena_hash: hash });
    const { contrasena_hash, ...usuarioSeguro } = usuario.get({ plain: true });
    return res.status(201).json({ mensaje: "Usuario creado", usuario: usuarioSeguro });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    const match = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!match) return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    const payload = { id: usuario.id, correo: usuario.correo };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '2h' });
    const { contrasena_hash, ...usuarioSeguro } = usuario.get({ plain: true });
    return res.json({ mensaje: "Inicio de sesión exitoso", token, usuario: usuarioSeguro });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};
