import { PerfilUsuario } from '../models/PerfilUsuario.js';

export const obtenerMiPerfil = async (req, res) => {
  try {
    const perfil = await PerfilUsuario.findByPk(req.user.id);
    if (!perfil) return res.status(404).json({ mensaje: 'Perfil no encontrado' });
    return res.json(perfil);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

export const guardarMiPerfil = async (req, res) => {
  try {
    const { saldo_inicial, perfil_inversion, telefono } = req.body;
    const perfil = await PerfilUsuario.findByPk(req.user.id);
    if (!perfil) {
      const creado = await PerfilUsuario.create({ id_usuario: req.user.id, saldo_inicial, perfil_inversion, telefono });
      return res.status(201).json(creado);
    } else {
      perfil.saldo_inicial = saldo_inicial ?? perfil.saldo_inicial;
      perfil.perfil_inversion = perfil_inversion ?? perfil.perfil_inversion;
      perfil.telefono = telefono ?? perfil.telefono;
      await perfil.save();
      return res.json(perfil);
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
};
