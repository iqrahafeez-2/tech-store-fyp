const mongoose = require('mongoose');
const axios = require('axios');

const ProductCache = require('../models/ProductCache');
const SearchLog = require('../models/SearchLog');
const memoryCache = require('../utils/memoryCache');
const { searchDummyJson, getDummyJsonProduct } = require('./providers/dummyJsonProvider');
const { dedupeProducts, applyFilters } = require('./normalizers');

const TTL_MINUTES = Number(process.env.PRODUCT_CACHE_TTL_MINUTES || 180);
const DEFAULT_QUERIES = ['laptop', 'smartphone', 'mobile accessories', 'mens watches', 'tablet'];

function mongoReady() {
  return mongoose.connection.readyState === 1;
}

function enabledProviders() {
  return {
    dummyjson: true,
    mongodbCache: mongoReady(),
    pythonAI: Boolean(process.env.PYTHON_AI_URL),
  };
}

function buildSearchKeywords(product, query) {
  return [query, product.title, product.brand, product.category, product.description]
    .join(' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 80);
}

async function saveProductsToCache(products, query = '') {
  if (!mongoReady()) {
    return;
  }

  await Promise.allSettled(
    products.map((product) =>
      ProductCache.findOneAndUpdate(
        {
          productId: product.productId || product.id,
        },
        {
          ...product,
          productId: product.productId || product.id,
          searchKeywords: buildSearchKeywords(product, query),
          cachedAt: new Date(),
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      )
    )
  );
}

async function readCachedSearch({
  q = '',
  category,
  brand,
  minPrice,
  maxPrice,
  sort,
  limit = 24,
}) {
  if (!mongoReady()) {
    return null;
  }

  const expires = new Date(Date.now() - TTL_MINUTES * 60 * 1000);
  const query = {
    cachedAt: {
      $gte: expires,
    },
  };

  if (q) {
    const clean = String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);

    query.$or = [
      { title: new RegExp(clean, 'i') },
      { brand: new RegExp(clean, 'i') },
      { category: new RegExp(clean, 'i') },
      { searchKeywords: { $in: terms } },
    ];
  }

  if (category && category !== 'all') {
    query.category = new RegExp(`^${category}$`, 'i');
  }

  if (brand && brand !== 'all') {
    query.brand = new RegExp(brand, 'i');
  }

  if (minPrice || maxPrice) {
    query.price = {};

    if (minPrice) {
      query.price.$gte = Number(minPrice);
    }

    if (maxPrice) {
      query.price.$lte = Number(maxPrice);
    }
  }

  let sortRule = {
    cachedAt: -1,
  };

  if (sort === 'price-low') {
    sortRule = { price: 1 };
  }

  if (sort === 'price-high') {
    sortRule = { price: -1 };
  }

  if (sort === 'rating') {
    sortRule = { rating: -1 };
  }

  if (sort === 'reviews') {
    sortRule = { reviewCount: -1 };
  }

  const docs = await ProductCache.find(query)
    .sort(sortRule)
    .limit(Number(limit))
    .lean();

  return docs.length ? docs.map((doc) => ({ ...doc, id: doc.productId })) : null;
}

async function searchProducts(options = {}) {
  const q = String(options.q || options.search || '').trim() || 'laptop';
  const limit = Math.min(Math.max(Number(options.limit) || 24, 1), 60);
  const cacheKey = memoryCache.makeKey('dummyjson-search', {
    ...options,
    q,
    limit,
  });

  const memoryResult = memoryCache.get(cacheKey);

  if (memoryResult) {
    return {
      ...memoryResult,
      cache: 'memory',
    };
  }

  const cached = await readCachedSearch({
    ...options,
    q,
    limit,
  });

  if (cached) {
    const response = {
      success: true,
      query: q,
      count: cached.length,
      products: cached,
      providers: enabledProviders(),
      providersUsed: ['mongodb-cache'],
      cache: 'mongodb',
    };

    memoryCache.set(cacheKey, response, Math.min(TTL_MINUTES, 15));
    return response;
  }

  const products = await searchDummyJson(q, limit);
  const normalized = dedupeProducts(products).map((product) => ({
    ...product,
    id: product.productId,
  }));

  const filtered = applyFilters(normalized, options).slice(0, limit);

  await saveProductsToCache(filtered, q);

  if (mongoReady()) {
    await SearchLog.create({
      query: q,
      category: options.category || 'all',
      brand: options.brand || 'all',
      resultCount: filtered.length,
      providersUsed: ['dummyjson'],
      userId: options.userId || 'guest',
    }).catch(() => null);
  }

  const response = {
    success: true,
    query: q,
    count: filtered.length,
    products: filtered,
    providers: enabledProviders(),
    providersUsed: ['dummyjson'],
    cache: 'fresh',
    notice: 'Products are loaded dynamically from DummyJSON API for the FYP demo.',
  };

  memoryCache.set(cacheKey, response, TTL_MINUTES);
  return response;
}

async function getProductById(productId) {
  const cached = memoryCache.get(`detail:${productId}`);

  if (cached) {
    return cached;
  }

  if (mongoReady()) {
    const doc = await ProductCache.findOne({ productId }).lean();

    if (doc) {
      const product = {
        ...doc,
        id: doc.productId,
      };

      memoryCache.set(`detail:${productId}`, product, 60);
      return product;
    }
  }

  const [source, ...idParts] = String(productId).split('_');
  const externalId = idParts.join('_');

  if (source !== 'dummyjson') {
    return null;
  }

  const product = await getDummyJsonProduct(externalId);

  if (!product) {
    return null;
  }

  const normalized = {
    ...product,
    id: product.productId,
  };

  await saveProductsToCache([normalized], normalized.title);
  memoryCache.set(`detail:${productId}`, normalized, 60);

  return normalized;
}

async function getTrendingProducts(limit = 12) {
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 4), 24);
  const cached = memoryCache.get(`trending:${safeLimit}`);

  if (cached) {
    return cached;
  }

  const searches = await Promise.all(
    DEFAULT_QUERIES.map((query) =>
      searchProducts({
        q: query,
        sort: 'rating',
        limit: Math.ceil(safeLimit / 2),
      })
    )
  );

  const trending = dedupeProducts(searches.flatMap((result) => result.products || []))
    .sort((a, b) => (b.rating || 0) + (b.reviewCount || 0) / 100 - ((a.rating || 0) + (a.reviewCount || 0) / 100))
    .slice(0, safeLimit);

  const response = {
    success: true,
    count: trending.length,
    products: trending,
    providersUsed: ['dummyjson'],
  };

  memoryCache.set(`trending:${safeLimit}`, response, 60);

  return response;
}

async function getSuggestions(q = '') {
  const text = String(q || '').trim();

  const base = [
    'iphone',
    'samsung phone',
    'laptop',
    'gaming laptop',
    'smartphone',
    'wireless headphones',
    'smart watch',
    'mobile accessories',
    'beauty tech',
    'tablet',
    'charger',
    'keyboard',
  ];

  let remote = [];

  if (text.length >= 2) {
    const result = await searchProducts({
      q: text,
      limit: 6,
    });

    remote = result.products.map((product) => product.title);
  }

  const suggestions = [...remote, ...base]
    .filter(Boolean)
    .filter((item, index, array) => array.findIndex((x) => x.toLowerCase() === item.toLowerCase()) === index)
    .filter((item) => !text || item.toLowerCase().includes(text.toLowerCase()) || item.toLowerCase().startsWith(text[0].toLowerCase()))
    .slice(0, 10);

  return {
    success: true,
    suggestions,
  };
}

async function getCategories() {
  const categories = [
    { name: 'Mobiles', slug: 'smartphones', icon: '📱' },
    { name: 'Laptops', slug: 'laptops', icon: '💻' },
    { name: 'Accessories', slug: 'mobile-accessories', icon: '🔌' },
    { name: 'Gaming', slug: 'laptops', icon: '🎮' },
    { name: 'Smart Devices', slug: 'mens-watches', icon: '⌚' },
    { name: 'Computer Hardware', slug: 'laptops', icon: '🧩' },
    { name: 'Technology', slug: 'technology', icon: '⚡' },
  ];

  let counts = {};

  if (mongoReady()) {
    const grouped = await ProductCache.aggregate([
      {
        $group: {
          _id: '$category',
          count: {
            $sum: 1,
          },
        },
      },
    ]).catch(() => []);

    counts = grouped.reduce((acc, item) => ({
      ...acc,
      [item._id]: item.count,
    }), {});
  }

  return {
    success: true,
    categories: categories.map((category) => ({
      ...category,
      count: counts[category.name] || 0,
    })),
  };
}

async function getBrands(q = '') {
  let brands = [
    'Apple',
    'Samsung',
    'Huawei',
    'Oppo',
    'Asus',
    'Lenovo',
    'Dell',
    'HP',
    'Sony',
    'Microsoft',
    'Logitech',
  ];

  if (mongoReady()) {
    const dbBrands = await ProductCache.distinct('brand').catch(() => []);
    brands = [...new Set([...dbBrands, ...brands])].filter(Boolean);
  }

  const filtered = q ? brands.filter((brand) => brand.toLowerCase().includes(q.toLowerCase())) : brands;

  return {
    success: true,
    brands: filtered.slice(0, 30),
  };
}

async function getAiRecommendations(payload = {}) {
  const seedQuery = payload.query || payload.usage || 'laptop';
  const result = await searchProducts({
    q: seedQuery,
    limit: 24,
    sort: 'rating',
  });

  const products = result.products || [];

  try {
    const { data } = await axios.post(
      `${process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000'}/recommend`,
      {
        query: seedQuery,
        products: products.map((product) => ({
          id: product.id || product.productId,
          title: product.title,
          category: product.category,
          brand: product.brand,
          price: product.price || 0,
          rating: product.rating || 0,
          description: product.description || '',
        })),
        user_interests: [payload.usage, payload.preferredBrand].filter(Boolean),
      },
      {
        timeout: 5000,
      }
    );

    const rankedIds = new Set((data.recommendations || []).map((item) => item.id || item.productId));

    const ordered = [
      ...products.filter((product) => rankedIds.has(product.id || product.productId)),
      ...products.filter((product) => !rankedIds.has(product.id || product.productId)),
    ].slice(0, 8);

    return {
      success: true,
      products: ordered,
      ai: data,
      source: 'python-ai',
    };
  } catch (error) {
    const fallback = [...products]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 8);

    return {
      success: true,
      products: fallback,
      source: 'node-fallback',
      message: 'Python AI service unavailable. Showing DummyJSON rating based recommendations.',
    };
  }
}

module.exports = {
  searchProducts,
  getProductById,
  getTrendingProducts,
  getSuggestions,
  getCategories,
  getBrands,
  getAiRecommendations,
  enabledProviders,
};