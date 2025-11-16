import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { main as performOCR } from "../services/ocrService.js";
import { categorizeDocument } from "../services/categorizeService.js";
import { uploadToAzure } from "../services/azureService.js";
import { sendNotification } from "../services/notificationService.js";
import { logger } from "../utils/logger.js";
import { AppError, asyncHandler } from "../middlewares/errorHandler.js";
import { DatabaseService } from "../config/database.js";

// In-memory storage fallback (when database is not available)
let processedDocuments = [];

/**
 * Process uploaded file with OCR and AI analysis
 */
export const processFile = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  if (!req.file) {
    throw new AppError("No file uploaded", 400);
  }

  const filePath = req.file.path;
  const fileName = req.file.sanitizedName || req.file.originalname;
  const fileId = uuidv4();

  logger.info('Processing file', { 
    fileId, 
    fileName, 
    size: req.file.size,
    mimetype: req.file.mimetype 
  });

  try {
    // Perform OCR and analysis
    const extractedText = await performOCR(filePath);
    
    if (!extractedText || extractedText.trim().length < 5) {
      throw new AppError("Could not extract text from document", 400);
    }
    
    // Categorize the document
    const { category, priority, analysis } = await categorizeDocument(extractedText, fileName);

    // Upload to Azure (optional - for production)
    let azureUrl = null;
    try {
      azureUrl = await uploadToAzure(filePath, fileName);
      logger.info('File uploaded to Azure', { fileId, azureUrl });
    } catch (azureError) {
      logger.warn("Azure upload failed", azureError, { fileId });
    }

    const processingTime = Date.now() - startTime;

    // Create document record
    const documentData = {
      id: fileId,
      filename: fileName,
      originalName: req.file.originalname,
      category,
      priority,
      analysis,
      extractedText,
      azureUrl,
      filePath: filePath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user?.id || 'anonymous',
      status: 'completed',
      processingTime,
      metadata: {
        aiModel: 'gemini-pro',
        ocrEngine: 'tesseract.js',
        processingDate: new Date()
      }
    };

    // Try to save to database, fall back to in-memory
    let document;
    try {
      document = await DatabaseService.saveDocument(documentData);
      logger.info('Document saved to database', { fileId });
    } catch (dbError) {
      logger.warn('Database save failed, using in-memory storage', dbError);
      documentData.uploadedAt = new Date().toISOString();
      processedDocuments.push(documentData);
      document = documentData;
    }

    // Send notification
    try {
      await sendNotification(document);
    } catch (notifError) {
      logger.warn('Notification failed', notifError);
    }

    logger.info('File processing completed', { 
      fileId, 
      processingTime: `${processingTime}ms`,
      category,
      priority
    });

    // Return response
    res.status(201).json({
      success: true,
      message: "Document processed successfully",
      document: {
        id: document.id,
        filename: document.filename,
        category: document.category,
        priority: document.priority,
        analysis: document.analysis,
        uploadedAt: document.uploadedAt || document.createdAt,
        extractedText: document.extractedText,
        size: document.fileSize || document.size,
        processingTime: `${processingTime}ms`
      }
    });

  } catch (error) {
    // Clean up file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
});

/**
 * Get all documents with pagination and filtering
 */
export const getDocuments = asyncHandler(async (req, res) => {
  const { category, priority, status, page = 1, limit = 50 } = req.query;

  const filters = {};
  if (category) filters.category = category;
  if (priority) filters.priority = priority;
  if (status) filters.status = status;

  try {
    // Try database first
    const result = await DatabaseService.getDocuments(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    logger.info('Documents fetched from database', {
      count: result.documents.length,
      total: result.pagination.total
    });

    res.json({
      success: true,
      ...result,
      documents: result.documents.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        category: doc.category,
        priority: doc.priority,
        analysis: doc.analysis,
        uploadedAt: doc.createdAt || doc.uploadedAt,
        extractedText: doc.extractedText,
        size: doc.fileSize || doc.size,
        status: doc.status
      }))
    });
  } catch (dbError) {
    // Fallback to in-memory storage
    logger.warn('Database query failed, using in-memory storage', dbError);
    
    let filtered = processedDocuments;
    
    if (filters.category) {
      filtered = filtered.filter(doc => doc.category === filters.category);
    }
    if (filters.priority) {
      filtered = filtered.filter(doc => doc.priority === filters.priority);
    }

    res.json({
      success: true,
      documents: filtered.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        category: doc.category,
        priority: doc.priority,
        analysis: doc.analysis,
        uploadedAt: doc.uploadedAt,
        extractedText: doc.extractedText,
        size: doc.size
      })),
      pagination: {
        page: 1,
        limit: filtered.length,
        total: filtered.length,
        pages: 1
      }
    });
  }
});

/**
 * Download file by document ID
 */
export const downloadFile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try database first
  let document;
  try {
    document = await DatabaseService.getDocumentById(id);
  } catch (dbError) {
    // Fallback to in-memory
    document = processedDocuments.find(doc => doc.id === id);
  }

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  // Check if file exists
  if (!fs.existsSync(document.filePath)) {
    throw new AppError("File not found on server", 404);
  }

  logger.info('File download initiated', { 
    documentId: id, 
    filename: document.filename 
  });

  // Set appropriate headers
  res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
  res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
  res.setHeader('Content-Length', document.fileSize || document.size);

  // Stream the file
  const fileStream = fs.createReadStream(document.filePath);
  
  fileStream.on('error', (error) => {
    logger.error('File stream error', error);
    throw new AppError('Error reading file', 500);
  });

  fileStream.pipe(res);
});

/**
 * Get document by ID with full details
 */
export const getDocumentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try database first
  let document;
  try {
    document = await DatabaseService.getDocumentById(id);
  } catch (dbError) {
    document = processedDocuments.find(d => d.id === id);
  }

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  logger.info('Document retrieved', { documentId: id });

  res.json({
    success: true,
    document: {
      id: document.id,
      filename: document.filename,
      category: document.category,
      priority: document.priority,
      analysis: document.analysis,
      extractedText: document.extractedText,
      uploadedAt: document.createdAt || document.uploadedAt,
      size: document.fileSize || document.size,
      status: document.status || 'completed',
      processingTime: document.processingTime
    }
  });
});

/**
 * Get document statistics
 */
export const getStatistics = asyncHandler(async (req, res) => {
  try {
    const stats = await DatabaseService.getStatistics();
    
    logger.info('Statistics retrieved', stats);
    
    res.json({
      success: true,
      statistics: stats
    });
  } catch (dbError) {
    // Fallback to in-memory calculation
    const stats = {
      total: processedDocuments.length,
      byCategory: {},
      byPriority: {},
      recentUploads: 0
    };

    processedDocuments.forEach(doc => {
      stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
      stats.byPriority[doc.priority] = (stats.byPriority[doc.priority] || 0) + 1;
    });

    res.json({
      success: true,
      statistics: stats
    });
  }
});

/**
 * Delete document and its associated file
 */
export const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.info('Document deletion initiated', { documentId: id });

  // Try to find document in database first
  let document;
  try {
    document = await DatabaseService.getDocumentById(id);
  } catch (dbError) {
    document = processedDocuments.find(d => d.id === id);
  }

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  // Delete physical file if it exists
  if (document.filePath && fs.existsSync(document.filePath)) {
    try {
      fs.unlinkSync(document.filePath);
      logger.info('Physical file deleted', { filePath: document.filePath });
    } catch (fileError) {
      logger.warn('Could not delete physical file', { error: fileError.message });
    }
  }

  // Delete from database
  try {
    await DatabaseService.deleteDocument(id);
    logger.info('Document deleted from database', { documentId: id });
  } catch (dbError) {
    // Delete from in-memory storage
    processedDocuments = processedDocuments.filter(d => d.id !== id);
    logger.info('Document deleted from memory', { documentId: id });
  }

  res.json({
    success: true,
    message: 'Document deleted successfully',
    documentId: id
  });
});
