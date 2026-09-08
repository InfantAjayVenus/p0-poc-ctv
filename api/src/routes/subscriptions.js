const express = require('express');
const store = require('../models/subscriptionStore');

const router = express.Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidDate(value) {
  return value === undefined || value === null || !Number.isNaN(new Date(value).getTime());
}

/**
 * GET /subscriptions
 * Returns all subscriptions. Supports optional ?user_id= filter.
 */
router.get('/', (req, res) => {
  const { user_id: userId } = req.query;
  let results = store.findAll();

  if (userId) {
    results = results.filter((s) => s.user_id === userId);
  }

  req.log.info('subscriptions.list', { count: results.length, filters: { user_id: userId || null } });
  res.json(results);
});

/**
 * GET /subscriptions/:id
 * Returns a single subscription by id.
 */
router.get('/:id', (req, res) => {
  const subscription = store.findById(req.params.id);

  if (!subscription) {
    req.log.warn('subscriptions.not_found', { subscription_id: req.params.id });
    return res.status(404).json({ error: 'Subscription not found' });
  }

  req.log.info('subscriptions.fetched', { subscription_id: subscription.id });
  res.json(subscription);
});

/**
 * GET /subscriptions/:id/crash
 * Diagnostic endpoint that intentionally crashes the process when the
 * given id is malformed or does not match any known subscription. Full
 * context (subscription id, reason, request id) is logged to Datadog
 * *before* the process terminates, so crash-reporting/alerting pipelines
 * can be exercised end-to-end. Not intended for production traffic.
 */
router.get('/:id/crash', (req, res) => {
  const { id } = req.params;
  const isValidFormat = UUID_REGEX.test(id);
  const subscription = isValidFormat ? store.findById(id) : null;

  if (isValidFormat && subscription) {
    req.log.info('subscriptions.crash_endpoint_hit_valid_id', { subscription_id: id });
    return res.json({ message: 'Valid, known id — no crash triggered', subscription });
  }

  const reason = isValidFormat ? 'unknown_subscription_id' : 'invalid_subscription_id';

  req.log.error('subscriptions.crash_triggered', {
    subscription_id: id,
    reason,
    http: { method: req.method, url: req.originalUrl },
  });

  // Thrown outside Express's request-handling try/catch (via setImmediate)
  // so it becomes an uncaughtException and crashes the process by design,
  // instead of being caught and turned into an HTTP error response.
  setImmediate(() => {
    throw Object.assign(new Error(`Crash triggered: ${reason} (id=${id})`), {
      reason,
      subscription_id: id,
      request_id: req.id,
    });
  });
});

/**
 * POST /subscriptions
 * Creates a subscription. Requires user_id and transaction_id.
 */
router.post('/', (req, res) => {
  const { user_id: userId, transaction_id: transactionId, expires_at: expiresAt, activated_at: activatedAt, is_active: isActive } = req.body || {};

  if (!userId || !transactionId) {
    req.log.warn('subscriptions.validation_failed', { reason: 'missing_required_fields' });
    return res.status(400).json({ error: 'user_id and transaction_id are required' });
  }

  if (!isValidDate(expiresAt) || !isValidDate(activatedAt)) {
    req.log.warn('subscriptions.validation_failed', { reason: 'invalid_date_format' });
    return res.status(400).json({ error: 'expires_at and activated_at must be valid dates' });
  }

  const subscription = store.create({
    user_id: userId,
    transaction_id: transactionId,
    expires_at: expiresAt,
    activated_at: activatedAt,
    is_active: isActive,
  });

  req.log.info('subscriptions.created', { subscription_id: subscription.id, user_id: subscription.user_id });
  res.status(201).json(subscription);
});

module.exports = router;
