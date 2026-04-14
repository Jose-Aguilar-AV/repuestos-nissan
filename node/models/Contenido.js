import { DataTypes } from "sequelize";
import { sequelize } from "../database/db.js";

export const Contenido = sequelize.define('Contenido', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  titulo: { type: DataTypes.STRING(255), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  url_video: { type: DataTypes.STRING(255), allowNull: true },
  fecha_publicacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: "contenidos",
  timestamps: false
});
