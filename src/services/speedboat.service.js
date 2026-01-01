import models from "../models/index.js";
import { Op } from "sequelize";
import dayjs from "dayjs";

const {
  Speedboat,
  CrewMember,
  KPI,
  Milestone,
  NextAction,
  Reflection,
  Dependency,
  Message,
  BudgetResource
} = models;

/**
 * Health barometer logic per uploaded spec.
 * Rules summarized:
 *  - On Track: progress >= 60 AND no overdue milestones AND KPIs trending toward target
 *  - Pending: progress 30-59 OR 1 milestone at-risk OR minor KPI drift
 *  - At Risk: progress < 30 OR multiple overdue milestones OR KPI moving away OR manual captain flag
 */
export async function computeHealthForSpeedboat(speedboat) {
  // speedboat may be plain object or sequelize instance with includes
  const progress = Number(speedboat.progress || 0);
  const manualOverride = !!speedboat.manual_health_override;
  if (manualOverride) return speedboat.health || "Pending";

  // fetch KPIs & milestones if not present
  const [kpis, milestones] = await Promise.all([
    speedboat.kpis ? speedboat.kpis : KPI.findAll({ where: { speedboat_id: speedboat.id } }),
    speedboat.milestones ? speedboat.milestones : Milestone.findAll({ where: { speedboat_id: speedboat.id } }),
  ]);

  // KPIs trending heuristic: count KPIs where current is moving toward target
  let kpiToward = 0, kpiAway = 0;
  for (const k of kpis || []) {
    if (k.current == null || k.target == null || k.baseline == null) continue;
    const baseline = Number(k.baseline), target = Number(k.target), current = Number(k.current);
    // If target > baseline (higher is better)
    if (target > baseline) {
      if (current >= baseline && current <= target) {
        if (current >= baseline && current >= ((baseline + target) / 2)) kpiToward++;
        else kpiToward += 0.5;
      } else if (current > target) kpiToward++;
      else kpiAway++;
    } else {
      // target < baseline (lower is better)
      if (current <= baseline && current >= target) {
        if (current <= ((baseline + target) / 2)) kpiToward++;
        else kpiToward += 0.5;
      } else if (current < target) kpiToward++;
      else kpiAway++;
    }
  }

  // milestones overdue/at-risk
  const now = dayjs();
  let overdueCount = 0, atRiskCount = 0;
  for (const m of milestones || []) {
    if (!m.due_date) continue;
    const due = dayjs(m.due_date);
    if (m.status === "Done" || m.status === "On Track") continue;
    if (due.isBefore(now, "day")) {
      const daysOver = now.diff(due, "day");
      if (daysOver >= 3) overdueCount++;
      else if (daysOver >= 0) atRiskCount++;
    } else {
      // not overdue
    }
  }

  // Decide health
  if (progress >= 60 && overdueCount === 0 && kpiAway === 0) return "On Track";
  if (progress < 30 || overdueCount >= 2 || kpiAway > 0) return "At Risk";
  // otherwise Pending (default catch-all)
  return "Pending";
}

/* CRUD / listing */
export async function createSpeedboat(payload) {
  const {
    guiding_spirit,
    challenge,
    measurement_of_success,
    current_status,
    crew,
    kpis,
    milestones,
    nextActions,
    reflections,
    dependencies,
    userId,
    ...rest
  } = payload;

  // Create speedboat with new fields included
  const speedboat = await Speedboat.create({
    ...rest,
    guiding_spirit,
    challenge,
    measurement_of_success,
    current_status,
    userId,
  });

  if (Array.isArray(crew)) {
    const items = crew.map((c) => {
      if (typeof c === "string") return { speedboat_id: speedboat.id, name: c };
      const { name, email } = c || {};
      return { speedboat_id: speedboat.id, name, email };
    });
    await CrewMember.bulkCreate(items);
  }

  if (Array.isArray(kpis)) {
    const items = kpis.map(k => ({ ...k, speedboat_id: speedboat.id }));
    await KPI.bulkCreate(items);
  }

  if (Array.isArray(milestones)) {
    const items = milestones.map(m => ({ ...m, speedboat_id: speedboat.id }));
    await Milestone.bulkCreate(items);
  }

  if (Array.isArray(nextActions)) {
    const items = nextActions.map(n => ({ ...n, speedboat_id: speedboat.id }));
    await NextAction.bulkCreate(items);
  }

  if (Array.isArray(reflections)) {
    const items = reflections.map(r => ({ ...r, speedboat_id: speedboat.id }));
    await Reflection.bulkCreate(items);
  }

  if (Array.isArray(dependencies)) {
    const items = dependencies.map(depId => ({
      speedboat_id: speedboat.id,
      depends_on_speedboat_id: depId,
    }));
    await Dependency.bulkCreate(items);
  }

  // return full object
  return getSpeedboat(speedboat.id);
}
export async function listSpeedboats({
  q,
  navigator,
  health,
  progressMin,
  progressMax,
  page = 1,
  size = 10,
  userId,
}) {
  const offset = (page - 1) * size;

  const where = { userId };

  //  Search in sponsor + navigators (ARRAY)
  if (q) {
    where[Op.or] = [
      { sponsor: { [Op.iLike]: `%${q}%` } },
      Sequelize.literal(`
        EXISTS (
          SELECT 1
          FROM unnest("Speedboat"."navigators") AS n
          WHERE n ILIKE '%${q}%'
        )
      `),
    ];
  }

  //  Health filter
  if (health) {
    where.health = health;
  }

  //  Progress range filter
  if (progressMin !== undefined || progressMax !== undefined) {
    where.progress = {};
    if (progressMin !== undefined) {
      where.progress[Op.gte] = Number(progressMin);
    }
    if (progressMax !== undefined) {
      where.progress[Op.lte] = Number(progressMax);
    }
  }

  //  Navigator filter (ARRAY search)
  if (navigator) {
    where[Op.and] = [
      ...(where[Op.and] || []),
      Sequelize.literal(`
        EXISTS (
          SELECT 1
          FROM unnest("Speedboat"."navigators") AS n
          WHERE n ILIKE '%${navigator}%'
        )
      `),
    ];
  }

  const { rows, count } = await Speedboat.findAndCountAll({
    where,
    limit: Number(size),
    offset: Number(offset),
    order: [["created_at", "DESC"]],
    distinct: true,
    include: [
      { model: CrewMember, as: "crew" },
      { model: KPI, as: "kpis" },
      { model: Milestone, as: "milestones" },
      { model: NextAction, as: "nextActions" },
      { model: Reflection, as: "reflections" },
      { model: Message, as: "messages" },
      { model: BudgetResource, as: "budgetResources" },
      {
        model: Speedboat,
        as: "dependsOn",
        through: { attributes: [] },
      },
    ],
  });

  return { items: rows, total: count, page, size };
}

export async function getSpeedboatById(id, userId) {
  const speedboat = await Speedboat.findByPk(id, {
    include: [
      { model: CrewMember, as: "crew" },
      { model: KPI, as: "kpis" },
      { model: Milestone, as: "milestones" },
      { model: NextAction, as: "nextActions" },
      { model: Reflection, as: "reflections" },
      { model: Message, as: "messages" },
      { model: BudgetResource, as: "budgetResources" },
      {
        model: Speedboat,
        as: "dependsOn",
        through: { attributes: [] },
      },
    ],
  });
   if (!speedboat || speedboat.userId !== userId) { const err = new Error("Speedboat not found or not owned by you"); err.status = 404; throw err; }
  return speedboat;
}

export async function getSpeedboat(id) {
  return Speedboat.findByPk(id, {
    include: [
      { model: CrewMember, as: "crew" },
      { model: KPI, as: "kpis" },
      { model: Milestone, as: "milestones" },
      { model: NextAction, as: "nextActions" },
      { model: Reflection, as: "reflections" },
      { model: Message, as: "messages" },
      { model: BudgetResource, as: "budgetResources" },
      {
        model: Speedboat,
        as: "dependsOn",
        through: { attributes: [] },
      },
    ],
  });
}

export async function updateSpeedboat(id, updates, userId) {
  const speedboat = await Speedboat.findByPk(id);
  if (!speedboat || speedboat.userId !== userId) {
    const err = new Error("Speedboat not found or not owned by you");
    err.status = 404;
    throw err;
  }

  const {
    guiding_spirit,
    challenge,
    measurement_of_success,
    current_status,
    crew,
    kpis,
    milestones,
    nextActions,
    reflections,
    dependencies,
    ...rest
  } = updates;

  // Update main speedboat table including new fields
  await speedboat.update({
    ...rest,
    guiding_spirit,
    challenge,
    measurement_of_success,
    current_status,
  });

  // For nested arrays we will do simple replace strategy
  if (Array.isArray(crew)) {
    await CrewMember.destroy({ where: { speedboat_id: id } });
    const items = crew.map((c) => {
      if (typeof c === "string") return { name: c, speedboat_id: id };
      const { name, email } = c || {};
      return { name, email, speedboat_id: id };
    });
    if (items.length) await CrewMember.bulkCreate(items);
  }

  if (Array.isArray(kpis)) {
    await KPI.destroy({ where: { speedboat_id: id } });
    const items = kpis.map(k => ({ ...k, speedboat_id: id }));
    if (items.length) await KPI.bulkCreate(items);
  }

  if (Array.isArray(milestones)) {
    await Milestone.destroy({ where: { speedboat_id: id } });
    const items = milestones.map(m => ({ ...m, speedboat_id: id }));
    if (items.length) await Milestone.bulkCreate(items);
  }

  if (Array.isArray(nextActions)) {
    await NextAction.destroy({ where: { speedboat_id: id } });
    const items = nextActions.map(n => ({ ...n, speedboat_id: id }));
    if (items.length) await NextAction.bulkCreate(items);
  }

  if (Array.isArray(reflections)) {
    await Reflection.destroy({ where: { speedboat_id: id } });
    const items = reflections.map(r => ({ ...r, speedboat_id: id }));
    if (items.length) await Reflection.bulkCreate(items);
  }

  if (Array.isArray(dependencies)) {
    await Dependency.destroy({ where: { speedboat_id: id } });
    const items = dependencies.map(depId => ({
      speedboat_id: id,
      depends_on_speedboat_id: depId,
    }));
    if (items.length) await Dependency.bulkCreate(items);
  }

  return getSpeedboat(id);
}

export async function deleteSpeedboat(id, userId) {
  const speedboat = await Speedboat.findByPk(id);
  if (!speedboat || speedboat.userId !== userId) {
    const err = new Error("Speedboat not found or not owned by you");
    err.status = 404;
    throw err;
  }
  await Speedboat.destroy({ where: { id } });
}

/**
 * Compute progress based on KPIs and milestones
 * Progress is the percentage of successful KPIs and milestones out of total.
 * A KPI is successful if its progress reaches 100%.
 * A milestone is successful if status is 'done'.
 */
export async function computeProgressForSpeedboat(speedboat) {
  // Get KPIs & milestones (same as before)
  const [kpis, milestones] = await Promise.all([
    speedboat.kpis ? speedboat.kpis : KPI.findAll({ where: { speedboat_id: speedboat.id } }),
    speedboat.milestones ? speedboat.milestones : Milestone.findAll({ where: { speedboat_id: speedboat.id } }),
  ]);

  const progressValues = [];

  // --- KPI PROGRESS NOW USES REAL PERCENT, NOT ONLY 100 ---
  if (kpis) {
    for (const k of kpis) {
      // If KPI is marked as completed, it contributes 100% to progress
      if (k.isCompleted) {
        progressValues.push(100);
        continue;
      }

      if (k.current == null || k.target == null || k.baseline == null) continue;

      const baseline = Number(k.baseline);
      const target = Number(k.target);
      const current = Number(k.current);

      let pct = 0;

      if (target > baseline) {
        // higher is better
        pct = ((current - baseline) / (target - baseline)) * 100;
      } else if (target < baseline) {
        // lower is better
        pct = ((baseline - current) / (baseline - target)) * 100;
      } else {
        pct = current === target ? 100 : 0;
      }

      pct = Math.max(0, Math.min(100, pct));
      progressValues.push(pct);
    }
  }

  // --- MILESTONES NOW GET SCORES (80 for On Track, etc.) ---
  const milestoneScore = {
    "done": 100,
    "Done": 100,
    "On Track": 70,
    "At Risk": 20,
    "at risk": 20,
    "blocked": 0,
    "Blocked": 0,
  };

  if (milestones) {
    for (const m of milestones) {
      const key = (m.status || "").trim();
      const score = milestoneScore[key] ?? 0;
      progressValues.push(score);
    }
  }

  // No KPIs or milestones → default 0
  if (progressValues.length === 0) return 0;

  // --- FINAL AVERAGE ---
  const avg = progressValues.reduce((sum, v) => sum + v, 0) / progressValues.length;
  return Math.round(avg);
}


/**
 * Touch speedboat updated_at
 */
export async function touchSpeedboat(id) {
  await Speedboat.update({ id }, { where: { id } });
}

/**
 * Recompute and update progress
 */
export async function recomputeProgress(id) {
  const speedboat = await getSpeedboat(id);
  if (!speedboat) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }
  const progress = await computeProgressForSpeedboat(speedboat);
  speedboat.progress = progress;
  await speedboat.save();
  return { id: speedboat.id, progress };
}

/**
 * recompute health & save
 */
export async function recomputeHealth(id) {
  const speedboat = await getSpeedboat(id);
  if (!speedboat) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }
  const health = await computeHealthForSpeedboat(speedboat);
  speedboat.health = health;
  await speedboat.save();
  return { id: speedboat.id, health };
}

/**
 * Refresh milestone statuses using the rules:
 * - pending when created
 * - on-track if current date < due date
 * - at-risk if 3-7 days overdue
 * - done when marked completed (status == 'done')
 */
export async function refreshMilestoneStatuses(speedboatId) {
  const milestones = await Milestone.findAll({ where: { speedboat_id: speedboatId } });
  const now = dayjs();

  for (const m of milestones) {
    if (m.status === "Done") continue;
    if (!m.due_date) {
      m.status = "Pending";
      await m.save();
      continue;
    }
    const due = dayjs(m.due_date);
    if (due.isAfter(now, "day")) {
      m.status = "On Track";
    } else {
      const daysOver = now.diff(due, "day");
      if (daysOver >= 3 && daysOver <= 7) m.status = "At Risk";
      else if (daysOver > 7) m.status = "At Risk"; // treat >7 as at-risk (client rule can be adjusted)
      else m.status = "At Risk"; // 0-2 days overdue => at-risk
    }
    await m.save();
  }

  // return updated list
  return Milestone.findAll({ where: { speedboat_id: speedboatId } });
}
