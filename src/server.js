import http from "http";
import app from "./app.js"; // your Express app
import { env } from "./config/env.js";
import { connectPostgres } from "./db/sequelize.js";

const server = http.createServer(app);

(async function bootstrap() {
  try {
    await connectPostgres(); // connect to Postgres first
    server.listen(env.port, "0.0.0.0", () => {
      console.log(`✅ Server running on http://192.168.1.66:${env.port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start:", err);
    process.exit(1);
  }
})();
