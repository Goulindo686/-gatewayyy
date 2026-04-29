const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Create new billing charge
router.post('/charges', billingController.createCharge);

// Get user's billings
router.get('/charges', billingController.getUserBillings);

// Get billing statistics
router.get('/stats', billingController.getBillingStats);

// Get single billing by ID
router.get('/charges/:id', billingController.getBillingById);

// Cancel billing
router.patch('/charges/:id/cancel', billingController.cancelBilling);

module.exports = router;
