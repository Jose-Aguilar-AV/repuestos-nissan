import { DataTypes } from "sequelize";
import { sequelize } from "../database/db.js";

export const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING(160),
      allowNull: false,
      unique: true,
    },
    contrasena_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("ACTIVO", "INACTIVO"),
      defaultValue: "ACTIVO",
    },
  },
  {
    tableName: "usuarios",
    timestamps: true,
    createdAt: "creado_en",
    updatedAt: "actualizado_en",
  }
);
