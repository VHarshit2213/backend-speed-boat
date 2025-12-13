import models from "../models/index.js";

const { Message, Speedboat } = models;

export async function createMessage(payload) {
  const sb = await Speedboat.findByPk(payload.speedboat_id);
  if (!sb) { const err = new Error("Speedboat not found"); err.status = 404; throw err; }

  return Message.create(payload);
}

export async function listMessages({ speedboat_id, page = 1, limit = 50 }) {
  const offset = (page - 1) * limit;
  const where = {};
  if (speedboat_id) where.speedboat_id = speedboat_id;

  const { rows, count } = await Message.findAndCountAll({
    where, order: [["created_at", "DESC"]], limit: Number(limit), offset: Number(offset)
  });

  return { items: rows, total: count, page, limit };
}

export async function getMessageById(id) {
  return Message.findByPk(id);
}

export async function updateMessage(id, updates) {
  const msg = await Message.findByPk(id);
  if (!msg) {
    const err = new Error("Message not found");
    err.status = 404;
    throw err;
  }
  return msg.update(updates);
}

export async function deleteMessage(id) {
  await Message.destroy({ where: { id } });
}
