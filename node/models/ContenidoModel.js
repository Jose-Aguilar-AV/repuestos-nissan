import { DataTypes } from "sequelize";
import db from "../database/db.js";

const ContenidoModel = db.define("contenidos", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo: { type: DataTypes.STRING(255), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  url_video: { type: DataTypes.STRING(255) },
  fecha_publicacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false,
});

export default ContenidoModel;
