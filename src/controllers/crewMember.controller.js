import { ApiResponse } from "../utils/ApiResponse.js";
import * as crewService from "../services/crewMember.service.js";

export const create = async (req, res) => {
  try {
    const item = await crewService.createCrewMember(req.body);
    return ApiResponse.created(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const list = async (req, res) => {
  try {
    const { page = 1, limit = 25, speedboat_id } = req.query;
    const result = await crewService.listCrewMembers({ page, limit, speedboat_id });
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const getById = async (req, res) => {
  try {
    const item = await crewService.getCrewMemberById(req.params.id);
    if (!item) return ApiResponse.notFound(res, "Crew member not found");
    return ApiResponse.ok(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const update = async (req, res) => {
  try {
    const item = await crewService.updateCrewMember(req.params.id, req.body);
    return ApiResponse.ok(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const remove = async (req, res) => {
  try {
    await crewService.deleteCrewMember(req.params.id);
    return ApiResponse.ok(res);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};
