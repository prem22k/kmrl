/**
 * Centralized Logging Utility
 * Provides structured logging with different levels and context
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO';
  }

  formatMessage(level, message, context = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
      environment: process.env.NODE_ENV || 'development'
    });
  }

  shouldLog(level) {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  error(message, error = null, context = {}) {
    if (this.shouldLog('ERROR')) {
      const errorDetails = error ? {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      } : {};
      
      console.error(this.formatMessage('ERROR', message, { ...context, ...errorDetails }));
    }
  }

  warn(message, context = {}) {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage('WARN', message, context));
    }
  }

  info(message, context = {}) {
    if (this.shouldLog('INFO')) {
      console.info(this.formatMessage('INFO', message, context));
    }
  }

  debug(message, context = {}) {
    if (this.shouldLog('DEBUG')) {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  // HTTP request logger
  httpRequest(req, res, duration) {
    this.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  }
}

export const logger = new Logger();

/**
 * Express middleware for request logging
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.httpRequest(req, res, duration);
  });
  
  next();
};
