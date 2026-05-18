const axios = require('axios');
const { normalizeSerpShoppingItem } = require('../normalizers');

function isEnabled() {
  return Boolean(process.env.SERPAPI_API_KEY);
}

async function searchSerpShopping(query = 'laptop', limit = 20) {
  if (!isEnabled()) return [];
  const { data } = await axios.get('https://serpapi.com/search.json', {
    timeout: 12000,
    params: {
      engine: 'google_shopping',
      q: query,
      api_key: process.env.SERPAPI_API_KEY,
      gl: process.env.SERPAPI_GL || 'us',
      hl: process.env.SERPAPI_HL || 'en',
      num: Math.min(Number(limit) || 20, 60),
    },
  });

  return Array.isArray(data.shopping_results) ? data.shopping_results.map(normalizeSerpShoppingItem) : [];
}

module.exports = { searchSerpShopping, isEnabled };
