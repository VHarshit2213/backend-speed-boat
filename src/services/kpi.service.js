import models from "../models/index.js";
import { touchSpeedboat, recomputeProgress } from "./speedboat.service.js";
const { KPI, Speedboat, sequelize } = models;

export async function createKPI({ speedboat_id, name, baseline, target, current, unit, position }, userId) {
  const sb = await Speedboat.findByPk(speedboat_id);
  // if (!sb || sb.userId !== userId) {
  //   const err = new Error("Speedboat not found or not owned by you");
  //   err.status = 404;
  //   throw err;
  // }
  // Derive position if not provided: append to end based on current max
  let resolvedPosition = position;
  if (resolvedPosition == null) {
    const maxPos = await KPI.max("position", { where: { speedboat_id } });
    resolvedPosition = Number.isFinite(maxPos) ? Number(maxPos) + 1 : 0;
  }

  const kpi = await KPI.create({
    speedboat_id,
    name,
    baseline,
    target,
    current,
    unit,
    position: resolvedPosition,
  });
  await touchSpeedboat(speedboat_id);
  await recomputeProgress(speedboat_id); // keep derived fields in sync when KPIs change
  return kpi;
}

export async function listKPIs({ page = 1, size = 25, speedboat_id }, userId) {

  const sb = await Speedboat.findByPk(speedboat_id);
  // if (!sb || sb.userId !== userId) {
  //   const err = new Error("Speedboat not found or not owned by you");
  //   err.status = 404;
  //   throw err;
  // }
  const offset = (page - 1) * size;
  const where = {};
  if (speedboat_id) where.speedboat_id = speedboat_id;
  const { rows, count } = await KPI.findAndCountAll({
    where,
    limit: Number(size),
    offset: Number(offset),
    order: [
      ["position", "ASC"],
      ["created_at", "ASC"],
    ],
  });
  return { items: rows, total: count, page, size };
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

export async function deleteKPI(id, userId) {
  const k = await KPI.findByPk(id);
  if (!k) {
    const err = new Error("KPI not found");
    err.status = 404;
    throw err;
  }
  if (k) {
    const speedboatId = k.speedboat_id;
    // soft delete
    await KPI.update({ is_deleted: true, deleted_at: new Date(), deleted_by: userId }, { where: { id } });
    // await KPI.destroy({ where: { id } });
    console.log('speedboatId :>> ', speedboatId);
    await touchSpeedboat(speedboatId);
    await recomputeProgress(speedboatId); // drop derived values to match new KPI set
  }
}

/**
 * Reorder all KPIs for a speedboat based on the provided list.
 * Expects kpi_ids to contain each KPI ID exactly once in desired order.
 */
export async function reorderKPIs(speedboat_id, kpi_ids = []) {
  const speedboat = await Speedboat.findByPk(speedboat_id);
  if (!speedboat) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }

  const existing = await KPI.findAll({ where: { speedboat_id } });
  const existingIds = new Set(existing.map((k) => k.id));

  // Validate: same set, no duplicates
  const seen = new Set();
  for (const id of kpi_ids) {
    if (seen.has(id)) {
      const err = new Error("Duplicate KPI id in order payload");
      err.status = 400;
      throw err;
    }
    seen.add(id);
    if (!existingIds.has(id)) {
      const err = new Error("KPI does not belong to this speedboat");
      err.status = 400;
      throw err;
    }
  }

  if (kpi_ids.length !== existing.length) {
    const err = new Error("Order payload must include all KPIs for this speedboat");
    err.status = 400;
    throw err;
  }

  await sequelize.transaction(async (t) => {
    for (let i = 0; i < kpi_ids.length; i++) {
      await KPI.update(
        { position: i },
        { where: { id: kpi_ids[i], speedboat_id }, transaction: t }
      );
    }
  });

  await touchSpeedboat(speedboat_id);

  const ordered = await KPI.findAll({
    where: { speedboat_id },
    order: [
      ["position", "ASC"],
      ["created_at", "ASC"],
    ],
  });

  return ordered;
}

export async function deletedListKPIs({ page = 1, size = 25, speedboat_id }, userId) {

  const sb = await Speedboat.findByPk(speedboat_id);
  const offset = (page - 1) * size;
  const where = {
    is_deleted: true
  };
  if (speedboat_id) where.speedboat_id = speedboat_id;
  const { rows, count } = await KPI.unscoped().findAndCountAll({
    where,
    limit: Number(size),
    offset: Number(offset),
    order: [
      ["deleted_at", "DESC"],
    ],
    include: [
      { model: models.User, as: "deletedByUser", attributes: ["id", "fullName", "email", "profileImage", "role"] },
      { model: Speedboat, as: "speedboat", attributes: ["name"] }
    ]
  });
  return { items: rows, total: count, page, size };
}

export async function restoreKPIs(id, userId) {
  const kpis = await KPI.unscoped().findByPk(id);
  if (!kpis || !kpis.is_deleted) {
    const err = new Error("Deleted kpis not found");
    err.status = 404;
    throw err;
  }

  await kpis.update({
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
  });

  await touchSpeedboat(kpis.speedboat_id);
  return kpis;
}