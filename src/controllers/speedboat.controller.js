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

export const uploadFiles = async (req, res) => {
  try {
    // Ensure speedboat exists
    const speedboat = await speedboatService.getSpeedboat(req.params.id);
    if (!speedboat) return ApiResponse.error(res, "Speedboat not found");

    if (!req.files || req.files.length === 0) {
      return ApiResponse.error(res, "No files uploaded");
    }

    const files = req.files.map((f) => ({
      originalName: f.originalname,
      fileName: f.filename,
      mimeType: f.mimetype,
      size: f.size,
      // Windows paths -> normalize to forward slashes for URLs
      path: f.path.replace(/\\/g, "/"),
      url: `${req.protocol}://${req.get("host")}/uploads/${f.filename}`,
    }));

    // persist files metadata into speedboat.files
    const savedDocs = await speedboatService.addFilesToSpeedboat(speedboat.id, files);

    // update speedboat touched timestamp
    await speedboatService.touchSpeedboat(speedboat.id);

    const documents = savedDocs.map((d) => ({
      id: d.id,
      fileName: d.file_name,
      originalName: d.original_name,
      mimeType: d.mime_type,
      size: d.size,
      path: d.path,
      url: d.url,
    }));

    return ApiResponse.ok(res, { documents, files: documents });
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

// Delete a document by its ID
export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    await speedboatService.deleteDocument(documentId, req.user);

    return ApiResponse.ok(res, { deleted: true });
  } catch (err) {
    return ApiResponse.error(res, err.message, err.status);
  }
};

// deleted speedboat List
export const deletedSBlist = async (req, res) => {
  try {
    const { q, navigator, health, progressMin, progressMax, page = 1, size = 25 } = req.query;
    const result = await speedboatService.deletedListSpeedboats({ q, navigator, health, progressMin, progressMax, page, size, userId: req.user.id });

    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const deletedDocumentList = async (req, res) => {
  try {
    const {page = 1, size = 25 } = req.query;
    const result = await speedboatService.deletedDocumentListSpeedboats({ page, size, userId: req.user.id });
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

// Restore
export const restore = async (req, res) => {
  try {
    const result = await speedboatService.restoreSpeedboat(req.params.id, req.user.id);
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const restoreDoc = async (req, res) => {
  try {
    const item = await speedboatService.restoreDocument(req.params.documentId, req.user.id);
    return ApiResponse.ok(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};
