import { DataTypes } from "sequelize";
import { sequelize } from "../database/db.js";

export const Transaccion = sequelize.define("Transaccion", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  id_portafolio: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  id_activo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  tipo: { type: DataTypes.ENUM('COMPRA','VENTA'), allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  valor: { type: DataTypes.DECIMAL(15,2), allowNull: false },
  fecha_transaccion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: "transacciones",
  timestamps: false
});
