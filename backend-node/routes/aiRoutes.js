const express = require('express');
const axios = require('axios');
const aggregator = require('../services/productAggregatorService');

const router = express.Router();
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000';

function normalizeProductForPython(product) {
  return {
    id: product.id || product.productId || '',
    productId: product.productId || product.id || '',
    title: product.title || '',
    category: product.category || 'Technology',
    rawCategory: product.rawCategory || '',
    brand: product.brand || 'Tech Brand',
    price: Number(product.price || 0),
    rating: Number(product.rating || 0),
    reviewCount: Number(product.reviewCount || 0),
    stock: Number(product.stock || 25),
    description: product.description || '',
    availability: product.availability || 'In stock',
    discountPercentage: Number(product.discountPercentage || 0),
  };
}

async function callPython(endpoint, payload, timeout = 7000) {
  const { data } = await axios.post(`${PYTHON_AI_URL}${endpoint}`, payload, { timeout });
  return data;
}

router.get('/health', async (req, res) => {
  try {
    const { data } = await axios.get(`${PYTHON_AI_URL}/health`, { timeout: 4000 });
    res.json({
      success: true,
      nodeAiProxy: true,
      python: data,
    });
  } catch (error) {
    res.json({
      success: true,
      nodeAiProxy: true,
      python: {
        success: false,
        status: 'unavailable',
        message: error.message,
      },
    });
  }
});

router.post('/recommend', async (req, res) => {
  const data = await aggregator.getAiRecommendations(req.body || {});
  res.json(data);
});

router.post('/chat', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();

    let products = Array.isArray(req.body?.products) ? req.body.products : [];

    if (!products.length && message) {
      const query =
        message.replace(/show|best|recommend|under|\$|\d+/gi, '').trim() || message;

      const searchData = await aggregator.searchProducts({
        q: query,
        limit: 4,
        sort: 'rating',
      });

      products = searchData.products || [];
    }

    const data = await callPython('/chat', {
      message,
      products: products.map(normalizeProductForPython),
    });

    res.json({
      ...data,
      products: products.slice(0, 4),
    });
  } catch (error) {
    const message = String(req.body?.message || '').toLowerCase();

    let reply = 'TechBot is using fallback mode. I can still help you search products, compare specs, and find recommendations.';

    if (message.includes('laptop')) {
      reply = 'For laptops, compare processor, RAM, SSD, display, battery life, rating and price.';
    }

    if (message.includes('phone') || message.includes('iphone')) {
      reply = 'For phones, compare camera, storage, display, battery, warranty and customer reviews.';
    }

    if (message.includes('gaming')) {
      reply = 'For gaming products, focus on graphics performance, refresh rate, comfort, compatibility and reviews.';
    }

    res.json({
      success: true,
      fallback: true,
      reply,
      products: [],
    });
  }
});

router.post('/suggest', async (req, res) => {
  try {
    const data = await callPython('/suggest', {
      query: req.body?.query || '',
      history: req.body?.history || [],
    });

    res.json(data);
  } catch (error) {
    const suggestions = await aggregator.getSuggestions(req.body?.query || req.body?.message || '');
    res.json(suggestions);
  }
});

router.post('/sentiment', async (req, res) => {
  try {
    const data = await callPython('/sentiment', {
      reviews: req.body?.reviews || [],
    });

    res.json(data);
  } catch (error) {
    res.json({
      success: true,
      positive: 80,
      neutral: 15,
      negative: 5,
      dominant: 'positive',
      fallback: true,
      summary: 'Python sentiment service was unavailable, so fallback sentiment was used.',
    });
  }
});

router.post('/trending-analysis', async (req, res) => {
  try {
    const products = Array.isArray(req.body?.products) ? req.body.products : [];

    const data = await callPython('/trending-analysis', {
      products: products.map(normalizeProductForPython),
    });

    res.json(data);
  } catch (error) {
    const products = Array.isArray(req.body?.products) ? req.body.products : [];

    const trending = products
      .map((product) => ({
        product,
        trendScore: Math.round(
          (Number(product.rating || 4) / 5) * 70 + Math.min(Number(product.reviewCount || 0), 100) * 0.3
        ),
        reason: 'Fallback trend score from rating and review count.',
      }))
      .sort((a, b) => b.trendScore - a.trendScore);

    res.json({
      success: true,
      fallback: true,
      trending,
    });
  }
});

router.post('/graph-search', async (req, res) => {
  try {
    const products = Array.isArray(req.body?.products) ? req.body.products : [];

    const data = await callPython('/graph-search', {
      query: req.body?.query || '',
      usage: req.body?.usage || 'study',
      budget: Number(req.body?.budget || 1000),
      products: products.map(normalizeProductForPython),
    });

    res.json(data);
  } catch (error) {
    res.json({
      success: true,
      fallback: true,
      initialState: req.body?.query || 'user product need',
      goalState: 'ranked product recommendation',
      bfsPath: ['User need', 'Category', 'Brand', 'Product'],
      astarRankedNodes: [],
      heuristic: 'Fallback heuristic unavailable because Python service is offline.',
    });
  }
});

router.post('/intelligence-lab', async (req, res) => {
  try {
    let products = Array.isArray(req.body?.products) ? req.body.products : [];

    if (!products.length) {
      const searchData = await aggregator.searchProducts({
        q: req.body?.query || 'laptop',
        limit: 12,
        sort: 'rating',
      });

      products = searchData.products || [];
    }

    const data = await callPython('/intelligence-lab', {
      query: req.body?.query || '',
      usage: req.body?.usage || 'study',
      budget: Number(req.body?.budget || 1000),
      preferredBrand: req.body?.preferredBrand || '',
      userInterests: req.body?.userInterests || [],
      products: products.map(normalizeProductForPython),
    });

    res.json({
      ...data,
      products,
    });
  } catch (error) {
    const searchData = await aggregator.searchProducts({
      q: req.body?.query || 'laptop',
      limit: 12,
      sort: 'rating',
    });

    const products = searchData.products || [];

    res.json({
      success: true,
      fallback: true,
      products,
      persona: {
        persona: 'Smart Buyer',
        budgetBand: 'balanced',
        priorities: ['rating', 'budget', 'stock', 'brand'],
        summary: 'Fallback buyer persona generated by Node.js.',
      },
      topPick: products[0] ? { product: products[0], aiScore: 92, reason: 'Best fallback match' } : null,
      bestValue: products[1] ? { product: products[1], aiScore: 88, reason: 'Best fallback value' } : null,
      ranked: products.map((product, index) => ({
        product,
        aiScore: Math.max(55, 95 - index * 4),
        reason: 'Fallback AI score based on rating and relevance.',
      })),
      productDNA: products.slice(0, 6).map((product, index) => ({
        id: product.id || product.productId,
        title: product.title,
        brand: product.brand,
        category: product.category,
        components: {
          contentMatch: Math.max(50, 90 - index * 5),
          budgetFit: 80,
          ratingStrength: Math.round((Number(product.rating || 4.5) / 5) * 100),
          popularity: 74,
          stockConfidence: 100,
          brandFit: 70,
          discountValue: 60,
          finalScore: Math.max(55, 92 - index * 4),
        },
        trend: {
          trendScore: Math.max(55, 90 - index * 3),
        },
        strengths: ['Available in stock', 'Strong rating', 'Good product match'],
        weaknesses: ['Fallback AI mode'],
      })),
      bfsPath: ['User need', 'Category match', 'Brand match', 'Product recommendation'],
      astarRankedNodes: products.slice(0, 5).map((product, index) => ({
        id: product.id || product.productId,
        title: product.title,
        heuristicScore: Math.max(0.5, 0.92 - index * 0.05),
        estimatedCost: Math.min(0.5, 0.08 + index * 0.05),
      })),
      explainability: {
        initialState: req.body?.query || 'user product need',
        goalState: 'best matched product',
        heuristic: '1 minus hybrid product score',
      },
    });
  }
});

module.exports = router;