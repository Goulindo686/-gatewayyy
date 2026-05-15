const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const { publicReadLimiter } = require('../middlewares/rate-limit.middleware');

// Rota pública — limita scraping de catálogo
router.get('/:slug', publicReadLimiter, storeController.getStoreBySlug);

module.exports = router;
