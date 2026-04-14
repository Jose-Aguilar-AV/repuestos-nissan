import { DataTypes } from "sequelize";
import { sequelize } from "../database/db.js";

export const Activo = sequelize.define("Activo", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  simbolo: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  tipo: { type: DataTypes.ENUM('ACCION','ETF','CRIPTO','BONO','OTRO'), defaultValue: 'ACCION' }
}, {
  tableName: "activos",
  timestamps: false
});
