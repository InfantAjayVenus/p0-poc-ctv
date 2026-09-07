const express = require('express');
const store = require('../models/subscriptionStore');

const router = express.Router();

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
