const winston = require('winston');

const { combine, timestamp, errors, json } = winston.format;

/**
 * Datadog-compatible logger.
 * Datadog's log agent/pipelines expect JSON logs with these conventions:
 *  - "message" for the human-readable log line
 *  - "level" for severity
 *  - "timestamp" in ISO-8601
 *  - "dd.trace_id" / "dd.span_id" for APM trace correlation (added per-log via child logger)
 *  - "service", "env", "version" for unified service tagging
 */
const service = process.env.DD_SERVICE || 'p0-poc';
const env = process.env.DD_ENV || process.env.NODE_ENV || 'development';
const version = process.env.DD_VERSION || '1.0.0';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: {
    service,
    env,
    version,
  },
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

/**
 * Returns a child logger enriched with request-scoped fields
 * (e.g. request_id, dd.trace_id) so every log line for a request
 * can be correlated in Datadog.
 */
function withContext(context = {}) {
  return logger.child(context);
}

module.exports = { logger, withContext };
