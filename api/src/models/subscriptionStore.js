const { randomUUID } = require('crypto');

/**
 * In-memory data store for subscriptions.
 * Fields: id, user_id, transaction_id, expires_at (Date), activated_at (Date), is_active (boolean)
 */
const subscriptions = new Map();

function toISO(value) {
  if (value === undefined || value === null) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function serialize(subscription) {
  return {
    ...subscription,
    expires_at: toISO(subscription.expires_at),
    activated_at: toISO(subscription.activated_at),
  };
}

function create({ user_id, transaction_id, expires_at, activated_at, is_active }) {
  const now = new Date();
  const subscription = {
    id: randomUUID(),
    user_id,
    transaction_id,
    expires_at: expires_at ? new Date(expires_at) : null,
    activated_at: activated_at ? new Date(activated_at) : now,
    is_active: is_active !== undefined ? Boolean(is_active) : true,
  };

  subscriptions.set(subscription.id, subscription);
  return serialize(subscription);
}

function findAll() {
  return Array.from(subscriptions.values()).map(serialize);
}

function findById(id) {
  const subscription = subscriptions.get(id);
  return subscription ? serialize(subscription) : null;
}

module.exports = { create, findAll, findById };
