import { ApiResponse } from "../utils/ApiResponse.js";
import * as svc from "../services/message.service.js";

export const create = async (req, res) => {
  try {
    const data = await svc.createMessage(req.body, req.user.id);
    return ApiResponse.created(res, data);
  } catch (err) { return ApiResponse.error(res, err.message); }
};

export const list = async (req, res) => {
  try {
    const data = await svc.listMessages(req.query, req.user.id);
    return ApiResponse.ok(res, data);
  } catch (err) { return ApiResponse.error(res, err.message); }
};

export const getById = async (req, res) => {
  try {
    const data = await svc.getMessageById(req.params.id);
    if (!data) return ApiResponse.notFound(res, "Not found");
    return ApiResponse.ok(res, data);
  } catch (err) { return ApiResponse.error(res, err.message); }
};

export const remove = async (req, res) => {
  try {
    await svc.deleteMessage(req.params.id);
    return ApiResponse.noContent(res);
  } catch (err) { return ApiResponse.error(res, err.message); }
};


export const update = async (req, res) => {
  try {
    const data = await svc.updateMessage(req.params.id, req.body);
    return ApiResponse.ok(res, data);
  } catch (err) { return ApiResponse.error(res, err.message); }
};