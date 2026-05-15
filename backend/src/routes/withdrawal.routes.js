const express = require('express');
const { body } = require('express-validator');
const withdrawalController = require('../controllers/withdrawal.controller');
const { auth, sellerOnly } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { withdrawalLimiter, readLimiter } = require('../middlewares/rate-limit.middleware');

const router = express.Router();

router.use(auth, sellerOnly);

// Solicitação de saque — operação financeira crítica, limite conservador
router.post('/', withdrawalLimiter, [
    body('amount').isFloat({ min: 1 }).withMessage('Valor mínimo de R$1,00'),
    validate
], withdrawalController.request);

router.get('/', readLimiter, withdrawalController.list);
router.get('/balance', readLimiter, withdrawalController.getBalance);

module.exports = router;
