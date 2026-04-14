import { DataTypes } from "sequelize";
import db from "../database/db.js";

const UserModel = db.define("usuarios", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  saldo_inicial: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 1000000,
  },
  perfil_inversionista: {
    type: DataTypes.ENUM("Conservador", "Moderado", "Agresivo"),
    defaultValue: "Moderado",
  },
  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

export default UserModel;
