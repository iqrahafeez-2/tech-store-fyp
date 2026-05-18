const axios = require('axios');
const { normalizeEbayItem } = require('../normalizers');

let tokenCache = { token: null, expiresAt: 0 };

function isEnabled() {
  return Boolean(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET);
}

async function getEbayToken() {
  if (!isEnabled()) return null;
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) return tokenCache.token;

  const credentials = Buffer.from(`${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`).toString('base64');
  const { data } = await axios.post(
    'https://api.ebay.com/identity/v1/oauth2/token',
    new URLSearchParams({ grant_type: 'client_credentials', scope: 'https://api.ebay.com/oauth/api_scope' }),
    {
      timeout: 9000,
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + Math.max(60, Number(data.expires_in || 7200) - 120) * 1000,
  };
  return tokenCache.token;
}

async function searchEbay(query = 'laptop', limit = 20) {
  if (!isEnabled()) return [];
  const token = await getEbayToken();
  const { data } = await axios.get('https://api.ebay.com/buy/browse/v1/item_summary/search', {
    timeout: 10000,
    params: {
      q: query,
      limit: Math.min(Number(limit) || 20, 50),
      filter: 'buyingOptions:{FIXED_PRICE}',
    },
    headers: {
      Authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': process.env.EBAY_MARKETPLACE_ID || 'EBAY_US',
    },
  });

  return Array.isArray(data.itemSummaries) ? data.itemSummaries.map(normalizeEbayItem) : [];
}

async function getEbayProduct(externalId) {
  if (!isEnabled()) return null;
  const token = await getEbayToken();
  const { data } = await axios.get(`https://api.ebay.com/buy/browse/v1/item/${encodeURIComponent(externalId)}`, {
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': process.env.EBAY_MARKETPLACE_ID || 'EBAY_US',
    },
  });
  return normalizeEbayItem(data);
}

module.exports = { searchEbay, getEbayProduct, isEnabled };
