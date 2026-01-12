import models from "../models/index.js";
import { touchSpeedboat } from "./speedboat.service.js";
const { NextAction, Speedboat } = models;

export async function createNextAction(
  { speedboat_id, task, owner, started_at, due_date },
  userId
) {
  const sb = await Speedboat.findByPk(speedboat_id);

  const now = new Date();

  if (!started_at) {
    started_at = now;
  }
  
  let status = "Pending";
  if (started_at && started_at <= now) {
    status = "In Progress";
  }

  const na = await NextAction.create({
    speedboat_id,
    task,
    owner,
    started_at,
    due_date,
    status,
  });

  await touchSpeedboat(speedboat_id);
  return na;
}


export async function listNextActions({ page = 1, limit = 25, speedboat_id }, userId) {
  const sb = await Speedboat.findByPk(speedboat_id);
  // if (!sb || sb.userId !== userId) {
  //   const err = new Error("Speedboat not found or not owned by you"); 
  //   err.status = 404;
  //   throw err;
  // }
  const offset = (page - 1) * limit;
  const where = {};
  if (speedboat_id) where.speedboat_id = speedboat_id;
  const { rows, count } = await NextAction.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [["created_at", "DESC"]],
  });
  return { items: rows, total: count, page, limit };
}

export async function getNextActionById(id) {
  return NextAction.findByPk(id);
}

export async function updateNextAction(id, updates) {
  const a = await NextAction.findByPk(id);
  if (!a) {
    const err = new Error("NextAction not found");
    err.status = 404;
    throw err;
  }
  if(updates.status && updates.status === "Completed" && !a.completed_at) {
    updates.completed_at = new Date();
  }
  await a.update(updates);
  await touchSpeedboat(a.speedboat_id);
  return a;
}

export async function deleteNextAction(id) {
  const a = await NextAction.findByPk(id);
  if (a) {
    const speedboatId = a.speedboat_id;
    await NextAction.destroy({ where: { id } });
    await touchSpeedboat(speedboatId);
  }
}
