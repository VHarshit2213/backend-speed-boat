import { ApiResponse } from "../utils/ApiResponse.js";
import * as actionService from "../services/nextAction.service.js";

export const create = async (req, res) => {
  try {
    const item = await actionService.createNextAction(req.body, req.user.id);
    return ApiResponse.created(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const list = async (req, res) => {
  try {
    const { page = 1, size = 25, speedboat_id } = req.query;
    const result = await actionService.listNextActions({ page, size, speedboat_id }, req.user.id);
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
    await actionService.deleteNextAction(req.params.id, req.user.id);
    return ApiResponse.ok(res);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const reorder = async (req, res) => {
  try {
    const { speedboat_id, next_action_ids } = req.body;
    const items = await actionService.reorderNextActions(speedboat_id, next_action_ids);
    return ApiResponse.ok(res, { items });
  } catch (err) {
    return ApiResponse.error(res, err.message, err.status || 500);
  }
};

export const deletedNextActionList = async (req, res) => {
  try {
    const { page = 1, size = 25, speedboat_id } = req.query;
    const result = await actionService.deletedListNextActions({ page, size, speedboat_id }, req.user.id);
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const restore = async (req, res) => {
  try {
    const item = await actionService.restoreNextAction(req.params.id, req.user.id);
    return ApiResponse.ok(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};