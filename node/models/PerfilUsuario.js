import { DataTypes } from "sequelize";
import { sequelize } from "../database/db.js";
import { Usuario } from "./Usuario.js";

export const PerfilUsuario = sequelize.define(
  "PerfilUsuario",
  {
    id_usuario: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      allowNull: false,
    },
    saldo_inicial: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false,
      defaultValue: 1000000.00,
    },
    perfil_inversion: {
      type: DataTypes.ENUM('CONSERVADOR','MODERADO','AGRESIVO'),
      defaultValue: 'MODERADO',
    },
    telefono: {
      type: DataTypes.STRING(30),
      allowNull: true,
    }
  },
  {
    tableName: "perfil_usuario",
    timestamps: false
  }
);

// Relaciones (definidas en app.js también)
