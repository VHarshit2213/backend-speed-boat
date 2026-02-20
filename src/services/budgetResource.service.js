import models from "../models/index.js";

const { BudgetResource, Speedboat } = models;

export async function createBudgetResource(payload, userId) {
  const sb = await Speedboat.findByPk(payload.speedboat_id);
  //  if (!sb || sb.userId !== userId) { const err = new Error("Speedboat not found or not owned by you"); err.status = 404; throw err; }

  return BudgetResource.create(payload);
}

export async function listBudgetResources({ speedboat_id, page = 1, limit = 50 }, userId) {

  const sb = await Speedboat.findByPk(speedboat_id);
  // if (!sb || sb.userId !== userId) {
  //   const err = new Error("Speedboat not found or not owned by you");
  //   err.status = 404;
  //   throw err;
  // }

  const offset = (page - 1) * limit;
  const where = {};
  if (speedboat_id) where.speedboat_id = speedboat_id;

  const { rows, count } = await BudgetResource.findAndCountAll({
    where, order: [["created_at", "DESC"]], limit: Number(limit), offset: Number(offset)
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
  const deleted = await BudgetResource.findByPk(id);
  if (!deleted) { const err = new Error("Entry not found"); err.status = 404; throw err; }
  await BudgetResource.update({ is_deleted: true }, { where: { id } });
}
