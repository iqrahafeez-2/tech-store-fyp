const aggregator = require('../services/productAggregatorService');

async function searchProducts(req, res, next) {
  try {
    const data = await aggregator.searchProducts({
      q: req.query.q || req.query.search || '',
      category: req.query.category || 'all',
      brand: req.query.brand || 'all',
      minPrice: req.query.minPrice || '',
      maxPrice: req.query.maxPrice || '',
      sort: req.query.sort || 'relevance',
      limit: req.query.limit || 24,
      userId: req.query.userId || 'guest',
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await aggregator.getProductById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found in cache or external source.' });
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
}

async function getTrending(req, res, next) {
  try {
    const data = await aggregator.getTrendingProducts(req.query.limit || 12);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function getSuggestions(req, res, next) {
  try {
    const data = await aggregator.getSuggestions(req.query.q || '');
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function getCategories(req, res, next) {
  try {
    const data = await aggregator.getCategories();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function getBrands(req, res, next) {
  try {
    const data = await aggregator.getBrands(req.query.q || '');
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function getRecommendations(req, res, next) {
  try {
    const data = await aggregator.getAiRecommendations(req.body || req.query || {});
    res.json(data);
  } catch (error) {
    next(error);
  }
}

function getProviderStatus(req, res) {
  res.json({ success: true, providers: aggregator.enabledProviders() });
}

module.exports = {
  searchProducts,
  getProduct,
  getTrending,
  getSuggestions,
  getCategories,
  getBrands,
  getRecommendations,
  getProviderStatus,
};
