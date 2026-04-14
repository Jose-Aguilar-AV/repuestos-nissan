import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config({ path: process.env.ENV_PATH || '.env' });

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
  }
);

export const conectarBD = async () => {
  try {
    await sequelize.authenticate();
    console.log(" Conexión a MySQL exitosa");
  } catch (e) {
    console.error("Error conectando a MySQL:", e.message);
    process.exit(1);
  }
};
