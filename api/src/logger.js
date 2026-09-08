const os = require('os');
const winston = require('winston');
const DatadogWinston = require('datadog-winston');

const { combine, timestamp, errors, json } = winston.format;

// datadog-winston only recognizes these region shorthands; anything else
// (e.g. "datadoghq.com") falls back to its default US1 intake.
const DD_SITE_TO_INTAKE_REGION = {
  'datadoghq.eu': 'eu',
  'us3.datadoghq.com': 'us3',
  'us5.datadoghq.com': 'us5',
};

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

const transports = [new winston.transports.Console()];

// Ship logs directly to Datadog's Logs intake API when an API key is
// configured. Without DD_API_KEY, logs still print as JSON on stdout
// so a Datadog Agent (or any log collector) can tail/forward them instead.
if (process.env.DD_API_KEY) {
  transports.push(
    new DatadogWinston({
      apiKey: process.env.DD_API_KEY,
      hostname: process.env.DD_HOSTNAME || os.hostname(),
      service,
      ddsource: 'nodejs',
      ddtags: `env:${env},version:${version}`,
      intakeRegion: DD_SITE_TO_INTAKE_REGION[process.env.DD_SITE],
    })
  );
}

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
  transports,
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
