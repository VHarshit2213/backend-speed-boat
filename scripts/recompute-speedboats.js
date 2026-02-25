import "../src/config/env.js"; // ensures dotenv is loaded
import models from "../src/models/index.js";
import {
  computeProgressForSpeedboat,
  computeHealthForSpeedboat,
} from "../src/services/speedboat.service.js";

const { Speedboat, KPI, sequelize } = models;

async function main() {
  await sequelize.authenticate();

  const speedboats = await Speedboat.findAll({
    include: [{ model: KPI, as: "kpis", required: false }],
  });

  let updated = 0;

  for (const sb of speedboats) {
    const progress = await computeProgressForSpeedboat(sb);
    const health = await computeHealthForSpeedboat(sb);

    const nextHealth = sb.manual_health_override ? sb.health : health;

    if (sb.progress !== progress || sb.health !== nextHealth) {
      sb.progress = progress;
      sb.health = nextHealth;
      await sb.save();
      updated++;
    }
  }

  console.log(
    `Recomputed progress/health for ${speedboats.length} speedboats; updated ${updated}.`
  );
  await sequelize.close();
}

main().catch((err) => {
  console.error("Recompute failed:", err);
  process.exit(1);
});
