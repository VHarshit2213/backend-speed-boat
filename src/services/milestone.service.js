import models from "../models/index.js";
import dayjs from "dayjs";
import { touchSpeedboat, recomputeProgress } from "./speedboat.service.js";
const { Milestone, Speedboat } = models;

export async function createMilestone({ speedboat_id, title, due_date, status }, userId) {
  const sb = await Speedboat.findByPk(speedboat_id);
  if (!sb || String(sb.userId) !== String(userId)) {
    const err = new Error("Speedboat not found or not owned by you");
    err.status = 404;
    throw err;
  }
  const m = await Milestone.create({ speedboat_id, title, due_date, status });
  await touchSpeedboat(speedboat_id);
  await recomputeProgress(speedboat_id);
  return m;
}

export async function listMilestones({ page = 1, limit = 25, speedboat_id }, userId) {
  const sb = await Speedboat.findByPk(speedboat_id);
  if (!sb || sb.userId !== userId) {
    const err = new Error("Speedboat not found or not owned by you");
    err.status = 404;
    throw err;
  }
  const offset = (page - 1) * limit;
  const where = {};
  if (speedboat_id) where.speedboat_id = speedboat_id;
  const { rows, count } = await Milestone.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [["due_date", "ASC"]],
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
  await recomputeProgress(m.speedboat_id);
  return m;
}

export async function deleteMilestone(id) {
  const m = await Milestone.findByPk(id);
  if (m) {
    const speedboatId = m.speedboat_id;
    await Milestone.destroy({ where: { id } });
    await touchSpeedboat(speedboatId);
    await recomputeProgress(speedboatId);
  }
}

/**
 * possible utility to auto-adjust status (if you want to call it)
 */
export function computeMilestoneStatus(milestone) {
  if (milestone.status === "Done") return "Done";
  if (!milestone.due_date) return "Pending";
  const now = dayjs();
  const due = dayjs(milestone.due_date);
  if (due.isAfter(now, "day")) return "On Track";
  const daysOver = now.diff(due, "day");
  if (daysOver >= 3 && daysOver <= 7) return "At Risk";
  return "At Risk";
}
