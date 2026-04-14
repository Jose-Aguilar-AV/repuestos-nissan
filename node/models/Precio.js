import { DataTypes } from "sequelize";
import { sequelize } from "../database/db.js";
import { Activo } from "./Activo.js";

export const Precio = sequelize.define("Precio", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  id_activo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  precio: { type: DataTypes.DECIMAL(15,4), allowNull: false }
}, {
  tableName: "precios",
  timestamps: false,
  indexes: [{ fields: ["id_activo","fecha"] }]
});
