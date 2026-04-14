import { DataTypes } from "sequelize";
import { sequelize } from "../database/db.js";
import { Usuario } from "./Usuario.js";

export const Portafolio = sequelize.define("Portafolio", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: "portafolios",
  timestamps: false
});
