import { ApiResponse } from "../utils/ApiResponse.js";
import * as milestoneService from "../services/milestone.service.js";

export const create = async (req, res) => {
  try {
    const item = await milestoneService.createMilestone(req.body, req.user.id);
    return ApiResponse.created(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const list = async (req, res) => {
  try {
    const { page = 1, limit = 25, speedboat_id } = req.query;
    const result = await milestoneService.listMilestones({ page, limit, speedboat_id }, req.user.id);
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const getById = async (req, res) => {
  try {
    const item = await milestoneService.getMilestoneById(req.params.id);
    if (!item) return ApiResponse.notFound(res, "Milestone not found");
    return ApiResponse.ok(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const update = async (req, res) => {
  try {
    const item = await milestoneService.updateMilestone(req.params.id, req.body);
    return ApiResponse.ok(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const remove = async (req, res) => {
  try {
    await milestoneService.deleteMilestone(req.params.id);
    return ApiResponse.ok(res);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const reorder = async (req, res) => {
  try {
    const { speedboat_id, milestone_ids } = req.body;
    const items = await milestoneService.reorderMilestones(speedboat_id, milestone_ids);
    return ApiResponse.ok(res, { items });
  } catch (err) {
    return ApiResponse.error(res, err.message, err.status || 500);
  }
};
