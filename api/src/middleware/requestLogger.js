const { randomUUID } = require('crypto');
const { withContext } = require('../logger');

/**
 * Adds a unique request id, attaches a request-scoped logger,
 * and logs the start/end of every request with latency and status,
 * giving observable, structured logs for each HTTP call.
 */
function requestLogger(req, res, next) {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const startTime = process.hrtime.bigint();

  req.id = requestId;
  req.log = withContext({ request_id: requestId, http: { method: req.method, url: req.originalUrl } });

  req.log.info('request.started');

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1e6;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    req.log[level]('request.completed', {
      http: {
        method: req.method,
        url: req.originalUrl,
        status_code: res.statusCode,
      },
      duration_ms: Number(durationMs.toFixed(2)),
    });
  });

  next();
}

module.exports = requestLogger;
