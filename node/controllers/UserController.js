import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

export const registrar = async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const nuevoUsuario = await UserModel.create({
      nombre,
      email,
      password: hash,
    });
    res.json(nuevoUsuario);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await UserModel.findOne({ where: { email } });
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, usuario.password);
    if (!match) return res.status(401).json({ mensaje: "Contraseña incorrecta" });

    const token = jwt.sign({ id: usuario.id }, "secreto123", { expiresIn: "1d" });
    res.json({ token, usuario });
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};
