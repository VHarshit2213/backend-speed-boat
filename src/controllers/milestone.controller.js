import { ApiResponse } from "../utils/ApiResponse.js";
import * as milestoneService from "../services/milestone.service.js";

export const create = async (req, res) => {
  try {
    const item = await milestoneService.createMilestone(req.body);
    return ApiResponse.created(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const list = async (req, res) => {
  try {
    const { page = 1, limit = 25, speedboat_id } = req.query;
    const result = await milestoneService.listMilestones({ page, limit, speedboat_id });
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
    return ApiResponse.noContent(res);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};
