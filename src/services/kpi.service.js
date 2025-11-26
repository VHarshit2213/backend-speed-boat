import models from "../models/index.js";
const { KPI, Speedboat } = models;

export async function createKPI({ speedboat_id, name, baseline, target, current, unit }) {
  const sb = await Speedboat.findByPk(speedboat_id);
  if (!sb) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }
  return KPI.create({ speedboat_id, name, baseline, target, current, unit });
}

export async function listKPIs({ page = 1, limit = 25, speedboat_id }) {
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
  return k;
}

export async function deleteKPI(id) {
  await KPI.destroy({ where: { id } });
}
