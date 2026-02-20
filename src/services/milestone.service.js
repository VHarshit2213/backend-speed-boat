import models from "../models/index.js";
import dayjs from "dayjs";
import { touchSpeedboat} from "./speedboat.service.js";
const { Milestone, Speedboat, sequelize } = models;

export async function createMilestone({ speedboat_id, title, due_date, status, position }, userId) {
  const sb = await Speedboat.findByPk(speedboat_id);
  // if (!sb || String(sb.userId) !== String(userId)) {
  //   const err = new Error("Speedboat not found or not owned by you");
  //   err.status = 404;
  //   throw err;
  // }
  let resolvedPosition = position;
  if (resolvedPosition == null) {
    const maxPos = await Milestone.max("position", { where: { speedboat_id } });
    resolvedPosition = Number.isFinite(maxPos) ? Number(maxPos) + 1 : 0;
  }

  const m = await Milestone.create({ speedboat_id, title, due_date, status, position: resolvedPosition });
  await touchSpeedboat(speedboat_id);
  return m;
}

export async function listMilestones({ page = 1, limit = 25, speedboat_id }, userId) {
  const sb = await Speedboat.findByPk(speedboat_id);
  // if (!sb || sb.userId !== userId) {
  //   const err = new Error("Speedboat not found or not owned by you");
  //   err.status = 404;
  //   throw err;
  // }
  const offset = (page - 1) * limit;
  const where = {};
  if (speedboat_id) where.speedboat_id = speedboat_id;
  const { rows, count } = await Milestone.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [
      ["position", "ASC"],
      ["created_at", "ASC"],
    ],
  });
  return { items: rows, total: count, page, limit };
}

export async function getMilestoneById(id) {
  return Milestone.findByPk(id);
}

export async function updateMilestone(id, updates) {
  const m = await Milestone.findByPk(id);
  if (!m) {
    const err = new Error("Milestone not found");
    err.status = 404;
    throw err;
  }
  // optional auto status calculation if due_date changed and status not explicitly set
  await m.update(updates);
  await touchSpeedboat(m.speedboat_id);
  // await refreshMilestoneStatuses(m.speedboat_id);
  return m;
}

export async function deleteMilestone(id) {
  const m = await Milestone.findByPk(id);
  if (!m) {
    const err = new Error("Milestone not found");
    err.status = 404;
    throw err;
  }
  if (m) {
    const speedboatId = m.speedboat_id;
    // soft delete
    await Milestone.update({ is_deleted: true }, { where: { id } });
    // await Milestone.destroy({ where: { id } });
    await touchSpeedboat(speedboatId);
  }
}

export async function reorderMilestones(speedboat_id, milestone_ids = []) {
  const speedboat = await Speedboat.findByPk(speedboat_id);
  if (!speedboat) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }

  const existing = await Milestone.findAll({ where: { speedboat_id } });
  const existingIds = new Set(existing.map((m) => m.id));

  const seen = new Set();
  for (const id of milestone_ids) {
    if (seen.has(id)) {
      const err = new Error("Duplicate milestone id in order payload");
      err.status = 400;
      throw err;
    }
    seen.add(id);
    if (!existingIds.has(id)) {
      const err = new Error("Milestone does not belong to this speedboat");
      err.status = 400;
      throw err;
    }
  }

  if (milestone_ids.length !== existing.length) {
    const err = new Error("Order payload must include all milestones for this speedboat");
    err.status = 400;
    throw err;
  }

  await sequelize.transaction(async (t) => {
    for (let i = 0; i < milestone_ids.length; i++) {
      await Milestone.update(
        { position: i },
        { where: { id: milestone_ids[i], speedboat_id }, transaction: t }
      );
    }
  });

  await touchSpeedboat(speedboat_id);

  const ordered = await Milestone.findAll({
    where: { speedboat_id },
    order: [
      ["position", "ASC"],
      ["created_at", "ASC"],
    ],
  });

  return ordered;
}

/**
 * possible utility to auto-adjust status (if you want to call it)
 */
export async function computeMilestoneStatus(milestone) {
  if (milestone.status === "Done") return "Done";
  if (!milestone.due_date) return "Pending";
  const now = dayjs();
  const due = dayjs(milestone.due_date);
  if (due.isAfter(now, "day")) return "On Track";
  const daysOver = now.diff(due, "day");
  if (daysOver >= 3 && daysOver <= 7) return "At Risk";
  return "At Risk";
}
