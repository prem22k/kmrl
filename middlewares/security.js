/**
 * Security Middleware
 * Implements comprehensive security measures
 */

import { AppError } from './errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Security headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://generativelanguage.googleapis.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://generativelanguage.googleapis.com"
  );
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  next();
};

/**
 * CORS configuration
 */
export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:5000'];
    
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin });
      callback(new AppError('Not allowed by CORS', 403));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

/**
 * Rate limiter configuration
 */
export const rateLimiterConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      statusCode: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      url: req.url
    });
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests. Please try again later.',
        statusCode: 429,
        retryAfter: '15 minutes'
      }
    });
  }
};

/**
 * Upload rate limiter - stricter for file uploads
 */
export const uploadRateLimiterConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 uploads per minute
  message: {
    success: false,
    error: {
      message: 'Too many upload requests. Please wait before uploading again.',
      statusCode: 429
    }
  },
  skipSuccessfulRequests: false
};

/**
 * File size limiter middleware
 */
export const fileSizeLimiter = (maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
      return next(new AppError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`, 413));
    }
    next();
  };
};

/**
 * Request sanitizer - removes potentially harmful data
 */
export const sanitizeRequest = (req, res, next) => {
  // Remove any __proto__ or constructor keys (prototype pollution prevention)
  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      delete obj.__proto__;
      delete obj.constructor;
      delete obj.prototype;
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitizeObject(obj[key]);
        }
      }
    }
  };

  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);

  next();
};

/**
 * IP whitelist/blacklist (optional)
 */
export const ipFilter = (req, res, next) => {
  const blacklistedIPs = process.env.BLACKLISTED_IPS
    ? process.env.BLACKLISTED_IPS.split(',')
    : [];
  
  const clientIP = req.ip || req.connection.remoteAddress;

  if (blacklistedIPs.includes(clientIP)) {
    logger.warn('Blocked blacklisted IP', { ip: clientIP });
    return next(new AppError('Access denied', 403));
  }

  next();
};

/**
 * Audit log middleware - logs sensitive operations
 */
export const auditLog = (action) => {
  return (req, res, next) => {
    logger.info('Audit Log', {
      action,
      user: req.user?.id || 'anonymous',
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString(),
      resource: req.params.id || req.body?.filename
    });
    next();
  };
};

/**
 * Prevent common attacks
 */
export const preventAttacks = (req, res, next) => {
  const suspiciousPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL injection
    /(\<script\>)|(\<\/script\>)/i,   // XSS
    /(\.\.\/)/i,                       // Path traversal
    /(\%0a)|(\%0d)/i,                  // CRLF injection
    /(eval\()|(\bexec\b)/i            // Code injection
  ];

  const checkString = JSON.stringify({ ...req.query, ...req.body });
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      logger.warn('Suspicious request detected', {
        ip: req.ip,
        url: req.url,
        pattern: pattern.toString()
      });
      return next(new AppError('Invalid request', 400));
    }
  }

  next();
};
