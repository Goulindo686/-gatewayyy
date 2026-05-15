const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { billingCreateLimiter, readLimiter } = require('../middlewares/rate-limit.middleware');

// All routes require authentication
router.use(authenticate);

// Create new billing charge — rate limited por usuário
router.post('/charges', billingCreateLimiter, billingController.createCharge);

// Leituras — rate limit mais permissivo
router.get('/charges', readLimiter, billingController.getUserBillings);
router.get('/stats', readLimiter, billingController.getBillingStats);
router.get('/charges/:id', readLimiter, billingController.getBillingById);

// Cancel billing
router.patch('/charges/:id/cancel', billingController.cancelBilling);

module.exports = router;
