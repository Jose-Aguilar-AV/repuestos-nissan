import { DataTypes } from "sequelize";
import db from "../database/db.js";
import UserModel from "./UserModel.js";

const PortafolioModel = db.define("portafolios", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

// 🔗 Relaciones
UserModel.hasMany(PortafolioModel, { foreignKey: "usuario_id" });
PortafolioModel.belongsTo(UserModel, { foreignKey: "usuario_id" });

export default PortafolioModel;
