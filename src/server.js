import http from "http";
import app from "./app.js"; // your Express app
import { env } from "./config/env.js";
import { connectPostgres } from "./db/sequelize.js";
import { Op } from "sequelize";
import cron from "node-cron";
import models from "./models/index.js";
import { refreshMilestoneStatuses, computeProgressForSpeedboat, computeHealthForSpeedboat } from "./services/speedboat.service.js";

const { Speedboat, CrewMember, KPI, Milestone, NextAction, Reflection } = models;

async function updateAllSpeedboats() {
  const speedboats = await Speedboat.findAll({
    include: [
      { model: CrewMember, as: "crew" },
      { model: KPI, as: "kpis" },
      { model: Milestone, as: "milestones" },
      { model: NextAction, as: "nextActions" },
      { model: Reflection, as: "reflections" },
      {
        model: Speedboat,
        as: "dependsOn",
        through: { attributes: [] },
      },
    ],
  });
  for (const speedboat of speedboats) {
    await refreshMilestoneStatuses(speedboat.id);
    // Refetch with updated milestones
    const updatedSpeedboat = await Speedboat.findByPk(speedboat.id, {
      include: [
        { model: CrewMember, as: "crew" },
        { model: KPI, as: "kpis" },
        { model: Milestone, as: "milestones" },
        { model: NextAction, as: "nextActions" },
        { model: Reflection, as: "reflections" },
        {
          model: Speedboat,
          as: "dependsOn",
          through: { attributes: [] },
        },
      ],
    });
    const progress = await computeProgressForSpeedboat(updatedSpeedboat);
    const health = await computeHealthForSpeedboat(updatedSpeedboat);
    await updatedSpeedboat.update({ progress, health });
  }
}

const server = http.createServer(app);

(async function bootstrap() {
  try {
    await connectPostgres(); // connect to Postgres first

    // Run initial update on startup
    // console.log('Running initial speedboat updates...');
    // await updateAllSpeedboats();
    // console.log('Initial speedboat updates completed.');

    // // Schedule nightly updates at 1 AM
    // cron.schedule('0 1 * * *', async () => {
    //   try {
    //     console.log('Starting nightly speedboat updates...');
    //     await updateAllSpeedboats();
    //     console.log('Nightly speedboat updates completed.');
    //   } catch (err) {
    //     console.error('Error in nightly speedboat updates:', err);
    //   }
    // });

    cron.schedule("0 1 * * *", async () => {
      const now = new Date();

      try {
        //  Pending → In Progress (start time reached)
        await NextAction.update(
          { status: "In Progress" },
          {
            where: {
              status: "Pending",
              started_at: { [Op.lte]: now },
              completed_at: null,
            },
          }
        );

        // In Progress / Pending → Delayed (deadline passed)
        await NextAction.update(
          { status: "Delayed" },
          {
            where: {
              deadline: { [Op.lt]: now },
              completed_at: null,
              status: { [Op.ne]: "Completed" },
            },
          }
        );
      } catch (err) {
        console.error("Error updating NextAction statuses:", err);
      }
    });

    const PORT = Number(env.PORT) || 4000;

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to start:", err);
    process.exit(1);
  }
})();
