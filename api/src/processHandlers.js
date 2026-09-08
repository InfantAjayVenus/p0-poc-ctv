const { logger } = require('./logger');

/**
 * Logs a fatal, unrecoverable error with full diagnostic context (message,
 * stack, origin) so it is observable in Datadog before the process exits.
 * A short delay gives async log transports (e.g. the Datadog HTTP intake)
 * a window to flush before the process actually terminates.
 */
function logFatalAndExit(error, origin) {
  logger.error('process.fatal', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...(error.reason && { reason: error.reason }),
      ...(error.subscription_id && { subscription_id: error.subscription_id }),
      ...(error.request_id && { request_id: error.request_id }),
    },
    origin,
  });

  setTimeout(() => process.exit(1), 1000);
}

/**
 * Registers process-wide handlers so uncaught exceptions and unhandled
 * promise rejections are always logged (with stack trace and context)
 * before the process crashes, instead of failing silently.
 */
function registerProcessHandlers() {
  process.on('uncaughtException', (error) => logFatalAndExit(error, 'uncaughtException'));
  process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logFatalAndExit(error, 'unhandledRejection');
  });
}

module.exports = { registerProcessHandlers };
