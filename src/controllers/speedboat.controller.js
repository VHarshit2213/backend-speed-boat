import { z } from "zod";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as speedboatService from "../services/speedboat.service.js";

// Create
export const create = async (req, res) => {
  try {
    const payload = { ...req.body, userId: req.user.id };
    const result = await speedboatService.createSpeedboat(payload);
    return ApiResponse.created(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

// List (with associations)
export const list = async (req, res) => {
  try {
    const { q, navigator, health, progressMin, progressMax, page = 1, size = 25 } = req.query;
    const result = await speedboatService.listSpeedboats({ q, navigator, health, progressMin, progressMax, page, size, userId: req.user.id });
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

// Get single
export const getById = async (req, res) => {
  try {
    const result = await speedboatService.getSpeedboatById(req.params.id, req.user.id);
    if (!result) return ApiResponse.error(res, "Speedboat not found");
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

// Update
export const update = async (req, res) => {
  try {
    const result = await speedboatService.updateSpeedboat(req.params.id, req.body, req.user.id);
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

// Delete
export const remove = async (req, res) => {
  try {
    await speedboatService.deleteSpeedboat(req.params.id, req.user.id);
    return ApiResponse.ok(res, "Deleted Successfully...");
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

// Extra endpoints
export const computeHealth = async (req, res) => {
  try {
    const result = await speedboatService.recomputeHealth(req.params.id);
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const updateMilestonesStatuses = async (req, res) => {
  try {
    const result = await speedboatService.refreshMilestoneStatuses(req.params.id);
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const recomputeProgress = async (req, res) => {
  try {
    const result = await speedboatService.recomputeProgress(req.params.id);
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const bulkShareSpeedboat = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;

    const result = await speedboatService.bulkShareSpeedboat({
      speedboatId: id,
      userIds,
      adminId: req.user.id,
    });

    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};


export const listAccessibleSpeedboats = async (req, res) => {
  try {
    const result = await speedboatService.listAccessibleSpeedboats({
      userId: req.user.id,
      page: req.query.page,
      size: req.query.size,
    });

    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};


export const revokeSpeedboatAccess = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const result = await speedboatService.revokeSpeedboatAccess({
      speedboatId: id,
      userId,
      adminId: req.user.id,
    });

    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};
