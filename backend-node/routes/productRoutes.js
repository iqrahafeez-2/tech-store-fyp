const express = require('express');
const controller = require('../controllers/productController');

const router = express.Router();

router.get('/providers', controller.getProviderStatus);
router.get('/search', controller.searchProducts);
router.get('/trending', controller.getTrending);
router.get('/suggestions', controller.getSuggestions);
router.get('/categories', controller.getCategories);
router.get('/brands', controller.getBrands);
router.post('/recommendations', controller.getRecommendations);
router.get('/:productId', controller.getProduct);

module.exports = router;
