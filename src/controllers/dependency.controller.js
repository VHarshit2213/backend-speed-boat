import { ApiResponse } from "../utils/ApiResponse.js";
import * as dependencyService from "../services/dependency.service.js";

export const create = async (req, res) => {
  try {
    const item = await dependencyService.createDependency(req.body);
    return ApiResponse.created(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const list = async (req, res) => {
  try {
    const { page = 1, limit = 25, speedboat_id } = req.query;
    const result = await dependencyService.listDependencies({ page, limit, speedboat_id });
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const getById = async (req, res) => {
  try {
    const item = await dependencyService.getDependencyById(req.params.id);
    if (!item) return ApiResponse.notFound(res, "Dependency not found");
    return ApiResponse.ok(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const remove = async (req, res) => {
  try {
    await dependencyService.deleteDependency(req.params.id);
    return ApiResponse.ok(res);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};
