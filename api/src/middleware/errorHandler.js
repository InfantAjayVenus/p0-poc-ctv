const { logger } = require('../logger');

/**
 * Centralized error handler: logs the error with full context
 * (stack trace, request id) so failures are observable in Datadog,
 * then returns a safe JSON error response.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const log = req.log || logger;

  log.error('request.error', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
    http: { method: req.method, url: req.originalUrl },
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : err.message,
  });
}

module.exports = errorHandler;
