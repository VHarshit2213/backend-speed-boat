import models from "../models/index.js";
import { Op } from "sequelize";

const { BudgetResource, Speedboat } = models;

export async function createBudgetResource(payload) {
  const sb = await Speedboat.findByPk(payload.speedboat_id);
  if (!sb) { const err = new Error("Speedboat not found"); err.status = 404; throw err; }

  return BudgetResource.create(payload);
}

export async function listBudgetResources({ speedboat_id, page = 1, limit = 50 }) {
  const offset = (page - 1) * limit;
  const where = {};
  if (speedboat_id) where.speedboat_id = speedboat_id;

  const { rows, count } = await BudgetResource.findAndCountAll({
    where, order: [["week_start", "DESC"]], limit: Number(limit), offset: Number(offset)
  });

  return { items: rows, total: count, page, limit };
}

export async function getBudgetResourceById(id) {
  return BudgetResource.findByPk(id);
}

export async function updateBudgetResource(id, updates) {
  const br = await BudgetResource.findByPk(id);
  if (!br) { const err = new Error("Entry not found"); err.status = 404; throw err; }
  await br.update(updates);
  return br;
}

export async function deleteBudgetResource(id) {
  await BudgetResource.destroy({ where: { id } });
}
