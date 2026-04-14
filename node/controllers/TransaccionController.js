import TransaccionModel from "../models/TransaccionModel.js";

export const registrarTransaccion = async (req, res) => {
  try {
    const transaccion = await TransaccionModel.create(req.body);
    res.json(transaccion);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

export const listarTransacciones = async (req, res) => {
  try {
    const lista = await TransaccionModel.findAll();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};
