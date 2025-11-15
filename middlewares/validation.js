/**
 * Input Validation Middleware
 * Validates and sanitizes user inputs
 */

import { AppError } from './errorHandler.js';

/**
 * Validate file upload
 */
export const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  const file = req.file;
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'text/plain'
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.txt'];
  const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

  // Validate MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return next(new AppError(
      `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`,
      400
    ));
  }

  // Validate file extension
  if (!allowedExtensions.includes(fileExtension)) {
    return next(new AppError(
      `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`,
      400
    ));
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return next(new AppError('File size exceeds 10MB limit', 400));
  }

  // Sanitize filename
  const sanitizedFilename = file.originalname
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_');
  
  file.sanitizedName = sanitizedFilename;

  next();
};

/**
 * Validate document ID parameter
 */
export const validateDocumentId = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError('Document ID is required', 400));
  }

  // UUID v4 validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    return next(new AppError('Invalid document ID format', 400));
  }

  next();
};

/**
 * Validate query parameters for document list
 */
export const validateDocumentQuery = (req, res, next) => {
  const { category, priority, page, limit } = req.query;

  const validCategories = [
    'Engineering',
    'Finance',
    'Procurement',
    'HR',
    'Legal',
    'Safety',
    'Regulatory',
    'Other'
  ];

  const validPriorities = ['High', 'Medium', 'Low'];

  if (category && !validCategories.includes(category)) {
    return next(new AppError(
      `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      400
    ));
  }

  if (priority && !validPriorities.includes(priority)) {
    return next(new AppError(
      `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
      400
    ));
  }

  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return next(new AppError('Page must be a positive number', 400));
  }

  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return next(new AppError('Limit must be between 1 and 100', 400));
  }

  next();
};

/**
 * Sanitize string inputs to prevent XSS
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Rate limiting validation
 */
export const validateRateLimit = (req, res, next) => {
  // This would typically integrate with a rate limiting library
  // For now, we'll implement basic tracking
  const ip = req.ip;
  const now = Date.now();
  
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const requests = global.rateLimitStore.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < 60000); // Last minute

  if (recentRequests.length > 100) { // 100 requests per minute
    return next(new AppError('Too many requests. Please try again later.', 429));
  }

  recentRequests.push(now);
  global.rateLimitStore.set(ip, recentRequests);

  // Clean up old entries every 1000 requests
  if (global.rateLimitStore.size > 1000) {
    const cutoff = now - 60000;
    for (const [key, times] of global.rateLimitStore.entries()) {
      const recent = times.filter(t => t > cutoff);
      if (recent.length === 0) {
        global.rateLimitStore.delete(key);
      } else {
        global.rateLimitStore.set(key, recent);
      }
    }
  }

  next();
};
