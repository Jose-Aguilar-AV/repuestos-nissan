import { DataTypes } from "sequelize";
import db from "../database/db.js";
import PortafolioModel from "./PortafolioModel.js";

const TransaccionModel = db.define("transacciones", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  portafolio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM("Compra", "Venta"),
    allowNull: false,
  },
  instrumento: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  valor: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  fecha_transaccion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

// 🔗 Relaciones
PortafolioModel.hasMany(TransaccionModel, { foreignKey: "portafolio_id" });
TransaccionModel.belongsTo(PortafolioModel, { foreignKey: "portafolio_id" });

export default TransaccionModel;
