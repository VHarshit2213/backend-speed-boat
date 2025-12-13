import { ApiResponse } from "../utils/ApiResponse.js";
import * as svc from "../services/budgetResource.service.js";

export const create = async (req, res) => {
  try {
    const data = await svc.createBudgetResource(req.body);
    return ApiResponse.created(res, data);
  } catch (err) { return ApiResponse.error(res, err.message); }
};

export const list = async (req, res) => {
  try {
    const data = await svc.listBudgetResources(req.query);
    return ApiResponse.ok(res, data);
  } catch (err) { return ApiResponse.error(res, err.message); }
};

export const getById = async (req, res) => {
  try {
    const data = await svc.getBudgetResourceById(req.params.id);
    if (!data) return ApiResponse.notFound(res, "Not found");
    return ApiResponse.ok(res, data);
  } catch (err) { return ApiResponse.error(res, err.message); }
};

export const update = async (req, res) => {
  try {
    const data = await svc.updateBudgetResource(req.params.id, req.body);
    return ApiResponse.ok(res, data);
  } catch (err) { return ApiResponse.error(res, err.message); }
};

export const remove = async (req, res) => {
  try {
    await svc.deleteBudgetResource(req.params.id);
    return ApiResponse.noContent(res);
  } catch (err) { return ApiResponse.error(res, err.message); }
};
