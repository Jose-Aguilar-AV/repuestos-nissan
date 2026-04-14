import PortafolioModel from "../models/PortafolioModel.js";

export const crearPortafolio = async (req, res) => {
  try {
    const portafolio = await PortafolioModel.create(req.body);
    res.json(portafolio);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

export const listarPortafolios = async (req, res) => {
  try {
    const lista = await PortafolioModel.findAll();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};
