import { DataTypes } from "sequelize";
import db from "../database/db.js";

const PrecioModel = db.define("precios", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  instrumento: { type: DataTypes.STRING(100), allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  precio: { type: DataTypes.DECIMAL(15, 4), allowNull: false },
}, {
  timestamps: false,
});

export default PrecioModel;
