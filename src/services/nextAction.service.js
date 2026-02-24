import models from "../models/index.js";
import { touchSpeedboat } from "./speedboat.service.js";
const { NextAction, Speedboat, sequelize } = models;

export async function createNextAction(
  { speedboat_id, task, owner, started_at, due_date, position },
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

  let resolvedPosition = position;
  if (resolvedPosition == null) {
    const maxPos = await NextAction.max("position", { where: { speedboat_id } });
    resolvedPosition = Number.isFinite(maxPos) ? Number(maxPos) + 1 : 0;
  }

  const na = await NextAction.create({
    speedboat_id,
    task,
    owner,
    started_at,
    due_date,
    status,
    position: resolvedPosition,
  });

  await touchSpeedboat(speedboat_id);
  return na;
}


export async function listNextActions({ page = 1, size = 25, speedboat_id }, userId) {
  const sb = await Speedboat.findByPk(speedboat_id);
  // if (!sb || sb.userId !== userId) {
  //   const err = new Error("Speedboat not found or not owned by you"); 
  //   err.status = 404;
  //   throw err;
  // }
  const offset = (page - 1) * size;
  const where = {};
  if (speedboat_id) where.speedboat_id = speedboat_id;
  const { rows, count } = await NextAction.findAndCountAll({
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

export async function deleteNextAction(id, userId) {
  const a = await NextAction.findByPk(id);
  if (!a) {
    const err = new Error("NextAction not found");
    err.status = 404;
    throw err;
  }
  if (a) {
    const speedboatId = a.speedboat_id;
    // soft delete
    await NextAction.update({ is_deleted: true, deleted_at: new Date(), deleted_by: userId }, { where: { id } });
    // await NextAction.destroy({ where: { id } });
    await touchSpeedboat(speedboatId);
  }
}

export async function reorderNextActions(speedboat_id, next_action_ids = []) {
  const speedboat = await Speedboat.findByPk(speedboat_id);
  if (!speedboat) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }

  const existing = await NextAction.findAll({ where: { speedboat_id } });
  const existingIds = new Set(existing.map((a) => a.id));

  const seen = new Set();
  for (const id of next_action_ids) {
    if (seen.has(id)) {
      const err = new Error("Duplicate next action id in order payload");
      err.status = 400;
      throw err;
    }
    seen.add(id);
    if (!existingIds.has(id)) {
      const err = new Error("Next action does not belong to this speedboat");
      err.status = 400;
      throw err;
    }
  }

  if (next_action_ids.length !== existing.length) {
    const err = new Error("Order payload must include all next actions for this speedboat");
    err.status = 400;
    throw err;
  }

  await sequelize.transaction(async (t) => {
    for (let i = 0; i < next_action_ids.length; i++) {
      await NextAction.update(
        { position: i },
        { where: { id: next_action_ids[i], speedboat_id }, transaction: t }
      );
    }
  });

  await touchSpeedboat(speedboat_id);

  const ordered = await NextAction.findAll({
    where: { speedboat_id },
    order: [
      ["position", "ASC"],
      ["created_at", "ASC"],
    ],
  });

  return ordered;
}

export async function deletedListNextActions({ page = 1, size = 25, speedboat_id }, userId) {

  const offset = (page - 1) * size;
  const where = {
    is_deleted: true
  };
  if (speedboat_id) where.speedboat_id = speedboat_id;
  const { rows, count } = await NextAction.unscoped().findAndCountAll({
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

export async function restoreNextAction(id, userId) {
  const nextAction = await NextAction.unscoped().findByPk(id);
  if (!nextAction || !nextAction.is_deleted) {
    const err = new Error("Deleted nextAction not found");
    err.status = 404;
    throw err;
  }

  await nextAction.update({
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
  });

  await touchSpeedboat(nextAction.speedboat_id);
  return nextAction;
}
