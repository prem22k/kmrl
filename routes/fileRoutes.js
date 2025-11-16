import express from "express";
import {  
  processFile, 
  getDocuments, 
  downloadFile, 
  getDocumentById,
  getStatistics,
  deleteDocument
} from "../controllers/fileController.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { 
  validateFileUpload, 
  validateDocumentId,
  validateDocumentQuery
} from "../middlewares/validation.js";
import { auditLog } from "../middlewares/security.js";

const router = express.Router();

/**
 * @route   POST /api/process-file
 * @desc    Upload and process a document with OCR and AI analysis
 * @access  Public (add auth later)
 */
router.post(
  "/process-file",
  upload.single("document"),
  validateFileUpload,
  auditLog('document_upload'),
  processFile
);

/**
 * @route   GET /api/documents
 * @desc    Get all processed documents with optional filtering
 * @query   category, priority, status, page, limit
 * @access  Public (add auth later)
 */
router.get(
  "/documents",
  validateDocumentQuery,
  getDocuments
);

/**
 * @route   GET /api/documents/:id
 * @desc    Get a specific document by ID
 * @access  Public (add auth later)
 */
router.get(
  "/documents/:id",
  validateDocumentId,
  getDocumentById
);

/**
 * @route   GET /api/download/:id
 * @desc    Download the original file by document ID
 * @access  Public (add auth later)
 */
router.get(
  "/download/:id",
  validateDocumentId,
  auditLog('document_download'),
  downloadFile
);

/**
 * @route   GET /api/statistics
 * @desc    Get document processing statistics
 * @access  Public (add auth later)
 */
router.get(
  "/statistics",
  getStatistics
);

/**
 * @route   DELETE /api/delete/:id
 * @desc    Delete a document and its associated file
 * @access  Public (add auth later)
 */
router.delete(
  "/delete/:id",
  validateDocumentId,
  auditLog('document_delete'),
  deleteDocument
);

export default router;
