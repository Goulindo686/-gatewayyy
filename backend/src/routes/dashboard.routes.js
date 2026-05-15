const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { auth, sellerOnly } = require('../middlewares/auth.middleware');
const { readLimiter } = require('../middlewares/rate-limit.middleware');

const router = express.Router();

router.use(auth, sellerOnly);
router.get('/stats', readLimiter, dashboardController.getStats);
router.get('/sales', readLimiter, dashboardController.getSales);

module.exports = router;
