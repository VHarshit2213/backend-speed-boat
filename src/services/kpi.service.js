import models from "../models/index.js";
import { touchSpeedboat, recomputeProgress } from "./speedboat.service.js";
const { KPI, Speedboat } = models;

export async function createKPI({ speedboat_id, name, baseline, target, current, unit }, userId) {
  const sb = await Speedboat.findByPk(speedboat_id);
  // if (!sb || sb.userId !== userId) {
  //   const err = new Error("Speedboat not found or not owned by you");
  //   err.status = 404;
  //   throw err;
  // }
  const kpi = await KPI.create({ speedboat_id, name, baseline, target, current, unit });
  await touchSpeedboat(speedboat_id);
  await recomputeProgress(speedboat_id); // keep derived fields in sync when KPIs change
  return kpi;
}

export async function listKPIs({ page = 1, limit = 25, speedboat_id }, userId) {

  const sb = await Speedboat.findByPk(speedboat_id);
  // if (!sb || sb.userId !== userId) {
  //   const err = new Error("Speedboat not found or not owned by you");
  //   err.status = 404;
  //   throw err;
  // }
  const offset = (page - 1) * limit;
  const where = {};
  if (speedboat_id) where.speedboat_id = speedboat_id;
  const { rows, count } = await KPI.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [["created_at", "DESC"]],
  });
  return { items: rows, total: count, page, limit };
}

export async function getKPIById(id) {
  return KPI.findByPk(id);
}

export async function updateKPI(id, updates) {
  const k = await KPI.findByPk(id);
  if (!k) {
    const err = new Error("KPI not found");
    err.status = 404;
    throw err;
  }
  await k.update(updates);
  await touchSpeedboat(k.speedboat_id);
  await recomputeProgress(k.speedboat_id); // refresh progress/health after KPI edits
  return k;
}

export async function deleteKPI(id) {
  const k = await KPI.findByPk(id);
  if (k) {
    const speedboatId = k.speedboat_id;
    await KPI.destroy({ where: { id } });
    await touchSpeedboat(speedboatId);
    await recomputeProgress(speedboatId); // drop derived values to match new KPI set
  }
}
