import { z } from "zod";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as speedboatService from "../services/speedboat.service.js";

// Create
export const create = async (req, res) => {
  try {
    const result = await speedboatService.createSpeedboat(req.body);
    return ApiResponse.created(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

// List (with associations)
export const list = async (req, res) => {
  try {
    const { q, mentor, sponsor, health, progressMin, progressMax, mentorName, page = 1, size = 10 } = req.query;
    const result = await speedboatService.listSpeedboats({ q, health, progressMin, progressMax, mentorName, page, size });
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

// Get single
export const getById = async (req, res) => {
  try {
    const result = await speedboatService.getSpeedboatById(req.params.id);
    if (!result) return ApiResponse.notFound(res, "Speedboat not found");
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

// Update
export const update = async (req, res) => {
  try {
    const result = await speedboatService.updateSpeedboat(req.params.id, req.body);
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

// Delete
export const remove = async (req, res) => {
  try {
    await speedboatService.deleteSpeedboat(req.params.id);
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
