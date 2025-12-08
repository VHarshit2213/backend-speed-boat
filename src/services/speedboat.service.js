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
    if (m.status === "done") continue;
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
  // create speedboat and optionally create nested relations if provided
  const {
    crew, kpis, milestones, nextActions, reflections, dependencies, ...rest
  } = payload;

  const speedboat = await Speedboat.create(rest);

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
  return getSpeedboatById(speedboat.id);
}
export async function listSpeedboats({ q, health, progressMin, progressMax, mentorName, page = 1, size = 10 }) {
  const offset = (page - 1) * size;
  const where = {};
  if (q) {
    where[Op.or] = [
      { mentor: { [Op.iLike]: `%${q}%` } },
      { sponsor: { [Op.iLike]: `%${q}%` } },
    ];
  }
 
  if (health) {
    where.health = health;
  }
  if (progressMin !== undefined) {
    where.progress = { ...where.progress, [Op.gte]: Number(progressMin) };
  }
  if (progressMax !== undefined) {
    where.progress = { ...where.progress, [Op.lte]: Number(progressMax) };
  }
  if (mentorName) {
    where.mentor = { [Op.iLike]: `%${mentorName}%` };
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
      {
        model: Speedboat,
        as: "dependsOn",
        through: { attributes: [] },
      },
    ],
  });

  return { items: rows, total: count, page, size };
}

export async function getSpeedboatById(id) {
  return Speedboat.findByPk(id, {
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
}

export async function updateSpeedboat(id, updates) {
  const speedboat = await Speedboat.findByPk(id);
  if (!speedboat) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }

  const {
    crew, kpis, milestones, nextActions, reflections, dependencies, ...rest
  } = updates;

  await speedboat.update(rest);

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

  return getSpeedboatById(id);
}

export async function deleteSpeedboat(id) {
  await Speedboat.destroy({ where: { id } });
}

/**
 * Touch speedboat updated_at
 */
export async function touchSpeedboat(id) {
  await Speedboat.update({ id }, { where: { id } });
}

/**
 * recompute health & save
 */
export async function recomputeHealth(id) {
  const speedboat = await getSpeedboatById(id);
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
    if (m.status === "done") continue;
    if (!m.due_date) {
      m.status = "pending";
      await m.save();
      continue;
    }
    const due = dayjs(m.due_date);
    if (due.isAfter(now, "day")) {
      m.status = "on-track";
    } else {
      const daysOver = now.diff(due, "day");
      if (daysOver >= 3 && daysOver <= 7) m.status = "at-risk";
      else if (daysOver > 7) m.status = "at-risk"; // treat >7 as at-risk (client rule can be adjusted)
      else m.status = "at-risk"; // 0-2 days overdue => at-risk
    }
    await m.save();
  }

  // return updated list
  return Milestone.findAll({ where: { speedboat_id: speedboatId } });
}
