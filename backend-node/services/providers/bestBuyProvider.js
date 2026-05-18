const axios = require('axios');
const { normalizeBestBuyProduct } = require('../normalizers');

const BASE_URL = 'https://api.bestbuy.com/v1/products';

function isEnabled() {
  return Boolean(process.env.BESTBUY_API_KEY);
}

function sanitizeBestBuySearch(value = '') {
  return String(value).replace(/[()]/g, ' ').trim();
}

async function searchBestBuy(query = 'laptop', limit = 20) {
  if (!isEnabled()) return [];

  const cleanQuery = sanitizeBestBuySearch(query);
  const pageSize = Math.min(Number(limit) || 20, 50);
  const show = [
    'sku',
    'name',
    'salePrice',
    'regularPrice',
    'image',
    'largeImage',
    'thumbnailImage',
    'url',
    'shortDescription',
    'longDescription',
    'manufacturer',
    'customerReviewAverage',
    'customerReviewCount',
    'onlineAvailability',
    'categoryPath.name',
    'details.name',
    'details.value',
  ].join(',');

  const url = `${BASE_URL}(search=${encodeURIComponent(cleanQuery)})`;
  const { data } = await axios.get(url, {
    timeout: 9000,
    params: {
      apiKey: process.env.BESTBUY_API_KEY,
      format: 'json',
      pageSize,
      show,
    },
  });

  return Array.isArray(data.products) ? data.products.map(normalizeBestBuyProduct) : [];
}

async function getBestBuyProduct(externalId) {
  if (!isEnabled()) return null;
  const show = 'sku,name,salePrice,regularPrice,image,largeImage,url,shortDescription,longDescription,manufacturer,customerReviewAverage,customerReviewCount,onlineAvailability,categoryPath.name,details.name,details.value';
  const url = `${BASE_URL}(sku=${encodeURIComponent(externalId)})`;
  const { data } = await axios.get(url, {
    timeout: 9000,
    params: { apiKey: process.env.BESTBUY_API_KEY, format: 'json', show },
  });
  const item = data.products?.[0];
  return item ? normalizeBestBuyProduct(item) : null;
}

module.exports = { searchBestBuy, getBestBuyProduct, isEnabled };
