const express = require('express');
const { logger } = require('./logger');
const { registerProcessHandlers } = require('./processHandlers');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const subscriptionsRouter = require('./routes/subscriptions');

registerProcessHandlers();

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  req.log.info('health.check');
  res.json({ status: 'ok' });
});

app.use('/subscriptions', subscriptionsRouter);

app.use((req, res) => {
  req.log.warn('route.not_found', { path: req.originalUrl });
  res.status(404).json({ error: 'Not Found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info('server.started', { port: PORT });
});

module.exports = app;
