import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import fileRoutes from "./routes/fileRoutes.js";
import { logger, requestLogger } from "./utils/logger.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { securityHeaders, corsOptions, sanitizeRequest, preventAttacks } from "./middlewares/security.js";
import { connectDatabase } from "./config/database.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy - required for rate limiting and IP detection behind proxies
app.set('trust proxy', 1);

// Connect to MongoDB (optional - falls back to in-memory if not configured)
if (process.env.MONGODB_URI) {
  connectDatabase().catch(err => {
    logger.warn('Database connection failed, using in-memory storage', { error: err.message });
  });
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // We set custom CSP in securityHeaders
  crossOriginEmbedderPolicy: false
}));
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(sanitizeRequest);
app.use(preventAttacks);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    features: ['delete-enabled'] // Force rebuild trigger
  });
});

// API routes
app.use("/api", fileRoutes);

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));
  
  // Catch-all route for React Router - use middleware for Express 5.x compatibility
  app.use((req, res, next) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
    } else {
      next();
    }
  });
} else {
  // Development mode - just serve API
  app.get("/", (req, res) => {
    res.json({ 
      success: true,
      message: "KMRL Smart Document Automation API", 
      version: "2.0.0",
      environment: "development",
      documentation: "/api/docs",
      frontend: "Run 'npm start' in the frontend directory for development",
      endpoints: {
        health: "/health",
        upload: "POST /api/process-file",
        documents: "GET /api/documents",
        download: "GET /api/download/:id"
      }
    });
  });
}

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
  
  if (process.env.NODE_ENV === 'production') {
    logger.info('Frontend available', { url: `http://localhost:${PORT}` });
  } else {
    logger.info('API available', { url: `http://localhost:${PORT}/api` });
    logger.info('Run React frontend separately: cd frontend && npm start');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
