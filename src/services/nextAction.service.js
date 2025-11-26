import models from "../models/index.js";
const { NextAction, Speedboat } = models;

export async function createNextAction({ speedboat_id, task, owner, due_date, status }) {
  const sb = await Speedboat.findByPk(speedboat_id);
  if (!sb) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }
  return NextAction.create({ speedboat_id, task, owner, due_date, status });
}

export async function listNextActions({ page = 1, limit = 25, speedboat_id }) {
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
  await a.update(updates);
  return a;
}

export async function deleteNextAction(id) {
  await NextAction.destroy({ where: { id } });
}
