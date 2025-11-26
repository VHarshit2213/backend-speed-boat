import { sequelize } from "../models/index.js";

export async function connectPostgres() {
  try {
    await sequelize.authenticate();
    console.log("✅ Postgres connected successfully");

    // Sync all tables
    // await sequelize.sync({ alter: true });
    // console.log("✅ All tables created or updated according to models");
  } catch (err) {
    console.error("❌ Unable to connect to Postgres:", err);
    process.exit(1);
  }
}
