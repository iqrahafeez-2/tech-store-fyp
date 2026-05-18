const axios = require('axios');
const { normalizeDummyJsonProduct } = require('../normalizers');

const BASE_URL = 'https://dummyjson.com/products';

const SMART_FALLBACKS = {
  iphone: 'smartphones',
  samsung: 'smartphones',
  galaxy: 'smartphones',
  phone: 'smartphones',
  mobile: 'smartphones',
  macbook: 'laptops',
  laptop: 'laptops',
  notebook: 'laptops',
  gaming: 'laptops',
  rtx: 'laptops',
  gpu: 'laptops',
  playstation: 'laptops',
  console: 'laptops',
  keyboard: 'mens-watches',
  mouse: 'mens-watches',
  headset: 'mobile-accessories',
  headphone: 'mobile-accessories',
  smartwatch: 'mens-watches',
  watch: 'mens-watches',
};

function pickFallbackQuery(query) {
  const text = String(query || '').toLowerCase();
  const match = Object.entries(SMART_FALLBACKS).find(([key]) => text.includes(key));
  return match ? match[1] : 'laptops';
}

function uniqueById(products) {
  const seen = new Set();

  return products.filter((product) => {
    if (!product || seen.has(product.id)) {
      return false;
    }

    seen.add(product.id);
    return true;
  });
}

async function requestDummy(url) {
  const { data } = await axios.get(url, {
    timeout: 12000,
  });

  return Array.isArray(data.products) ? data.products : [];
}

async function searchDummyJson(query = 'laptop', limit = 24) {
  const safeLimit = Math.min(Math.max(Number(limit) || 24, 8), 60);
  const q = encodeURIComponent(query || 'laptop');

  let products = await requestDummy(`${BASE_URL}/search?q=${q}&limit=${safeLimit}`);

  if (products.length === 0) {
    const fallback = pickFallbackQuery(query);
    products = await requestDummy(`${BASE_URL}/category/${encodeURIComponent(fallback)}?limit=${safeLimit}`);
  }

  if (products.length === 0) {
    const [laptops, phones] = await Promise.all([
      requestDummy(`${BASE_URL}/category/laptops?limit=${Math.ceil(safeLimit / 2)}`),
      requestDummy(`${BASE_URL}/category/smartphones?limit=${Math.ceil(safeLimit / 2)}`),
    ]);

    products = [...laptops, ...phones];
  }

  return uniqueById(products)
    .slice(0, safeLimit)
    .map(normalizeDummyJsonProduct);
}

async function getDummyJsonProduct(externalId) {
  const cleanId = String(externalId || '').replace(/[^0-9]/g, '');

  if (!cleanId) {
    return null;
  }

  const { data } = await axios.get(`${BASE_URL}/${cleanId}`, {
    timeout: 12000,
  });

  return normalizeDummyJsonProduct(data);
}

async function getDummyJsonCategories() {
  const { data } = await axios.get(`${BASE_URL}/categories`, {
    timeout: 12000,
  });

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => (typeof item === 'string' ? { slug: item, name: item } : item));
}

module.exports = {
  searchDummyJson,
  getDummyJsonProduct,
  getDummyJsonCategories,
};