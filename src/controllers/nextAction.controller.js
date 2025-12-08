import { ApiResponse } from "../utils/ApiResponse.js";
import * as actionService from "../services/nextAction.service.js";

export const create = async (req, res) => {
  try {
    const item = await actionService.createNextAction(req.body);
    return ApiResponse.created(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const list = async (req, res) => {
  try {
    const { page = 1, limit = 25, speedboat_id } = req.query;
    const result = await actionService.listNextActions({ page, limit, speedboat_id });
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const getById = async (req, res) => {
  try {
    const item = await actionService.getNextActionById(req.params.id);
    if (!item) return ApiResponse.notFound(res, "Next action not found");
    return ApiResponse.ok(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const update = async (req, res) => {
  try {
    const item = await actionService.updateNextAction(req.params.id, req.body);
    return ApiResponse.ok(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const remove = async (req, res) => {
  try {
    await actionService.deleteNextAction(req.params.id);
    return ApiResponse.ok(res);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};
