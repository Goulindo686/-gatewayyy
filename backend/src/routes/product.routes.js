const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/product.controller');
const { auth, sellerOnly } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { publicReadLimiter, readLimiter } = require('../middlewares/rate-limit.middleware');

const router = express.Router();

// Rota pública para checkout — limita enumeração de produtos
router.get('/public/:id', publicReadLimiter, productController.getPublic);

// Protected routes (seller)
router.use(auth, sellerOnly);

router.post('/', [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('price').isFloat({ min: 0.01 }).withMessage('Preço deve ser maior que zero'),
    validate
], productController.create);

router.get('/', readLimiter, productController.list);
router.get('/:id', readLimiter, productController.getById);

router.put('/:id', [
    body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
    body('price').optional().isFloat({ min: 0.01 }).withMessage('Preço deve ser maior que zero'),
    validate
], productController.update);

router.delete('/:id', productController.delete);

// Manual Delivery (Grant access to student)
router.post('/:id/enroll', [
    body('email').isEmail().withMessage('E-mail inválido'),
    validate
], productController.enrollUser);

module.exports = router;
