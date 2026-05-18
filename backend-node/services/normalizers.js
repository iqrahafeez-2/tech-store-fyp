function safeString(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function safeNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeId(source, externalId) {
  const raw = safeString(externalId, `${source}-${Date.now()}`);
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return `${source}_${clean}`;
}

function categoryFromText(text = '') {
  const value = text.toLowerCase();
  if (/(iphone|galaxy|pixel|oneplus|phone|mobile|smartphone)/.test(value)) return 'Mobiles';
  if (/(macbook|laptop|notebook|thinkpad|xps|pavilion|rog|legion)/.test(value)) return 'Laptops';
  if (/(rtx|gpu|graphics|processor|cpu|motherboard|ram|ssd|hardware)/.test(value)) return 'Computer Hardware';
  if (/(playstation|xbox|nintendo|gaming|controller|console)/.test(value)) return 'Gaming';
  if (/(watch|smartwatch|iot|smart home|alexa|google home)/.test(value)) return 'Smart Devices';
  if (/(headphone|earbuds|keyboard|mouse|charger|adapter|accessory|cable)/.test(value)) return 'Accessories';
  return 'Technology';
}

function brandFromText(text = '', fallback = 'Unknown') {
  const brands = [
    'Apple', 'Samsung', 'Sony', 'Microsoft', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer',
    'MSI', 'NVIDIA', 'AMD', 'Intel', 'Logitech', 'Razer', 'Corsair', 'Kingston',
    'Western Digital', 'Seagate', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'PlayStation',
  ];
  const found = brands.find((brand) => text.toLowerCase().includes(brand.toLowerCase()));
  return found || fallback || 'Unknown';
}

function buildSpecsObject(details) {
  if (!details) return {};
  if (Array.isArray(details)) {
    return details.reduce((acc, item) => {
      const key = safeString(item.name || item.key || item.label);
      const value = safeString(item.value || item.description || item.displayValue);
      if (key && value) acc[key] = value;
      return acc;
    }, {});
  }
  if (typeof details === 'object') return details;
  return {};
}

function normalizeDummyJsonProduct(item) {
  const title = safeString(item.title, 'Untitled Product');
  const description = safeString(item.description, 'No description available.');
  const images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
  return {
    productId: normalizeId('dummyjson', item.id),
    source: 'dummyjson',
    externalId: safeString(item.id),
    title,
    description,
    category: categoryFromText(`${item.category} ${title}`),
    brand: safeString(item.brand, brandFromText(title)),
    price: safeNumber(item.price),
    currency: 'USD',
    rating: safeNumber(item.rating),
    reviewCount: Array.isArray(item.reviews) ? item.reviews.length : 0,
    availability: item.stock > 0 ? 'In stock' : 'Out of stock',
    image: images[0] || item.thumbnail || '',
    images: images.length ? images : [item.thumbnail].filter(Boolean),
    specifications: {
      brand: item.brand || brandFromText(title),
      category: item.category,
      warranty: item.warrantyInformation,
      shipping: item.shippingInformation,
      returnPolicy: item.returnPolicy,
      stock: item.stock,
      sku: item.sku,
      weight: item.weight,
    },
    reviews: Array.isArray(item.reviews) ? item.reviews.slice(0, 6) : [],
    productUrl: '',
    sourcePayload: item,
  };
}

function normalizeBestBuyProduct(item) {
  const title = safeString(item.name, 'Best Buy Product');
  const description = safeString(item.longDescription || item.shortDescription || item.description, 'No description available.');
  const specs = buildSpecsObject(item.details);
  const category = Array.isArray(item.categoryPath) && item.categoryPath.length
    ? item.categoryPath[item.categoryPath.length - 1].name
    : categoryFromText(title);
  const image = item.largeImage || item.image || item.thumbnailImage || '';
  return {
    productId: normalizeId('bestbuy', item.sku),
    source: 'bestbuy',
    externalId: safeString(item.sku),
    title,
    description,
    category: categoryFromText(`${category} ${title}`),
    brand: safeString(item.manufacturer, brandFromText(title)),
    price: safeNumber(item.salePrice || item.regularPrice),
    currency: 'USD',
    rating: safeNumber(item.customerReviewAverage),
    reviewCount: safeNumber(item.customerReviewCount, 0),
    availability: item.onlineAvailability ? 'Available online' : 'Check store availability',
    image,
    images: [image, item.alternateViewsImage, item.angleImage].filter(Boolean),
    specifications: specs,
    reviews: [],
    productUrl: item.url || '',
    sourcePayload: item,
  };
}

function normalizeEbayItem(item) {
  const title = safeString(item.title, 'eBay Product');
  const image = item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || '';
  const images = [image, ...(item.additionalImages || []).map((x) => x.imageUrl)].filter(Boolean);
  return {
    productId: normalizeId('ebay', item.itemId),
    source: 'ebay',
    externalId: safeString(item.itemId),
    title,
    description: safeString(item.shortDescription || item.subtitle, 'Live marketplace listing from eBay.'),
    category: categoryFromText(`${item.categoryPath || ''} ${title}`),
    brand: brandFromText(`${title} ${JSON.stringify(item.localizedAspects || [])}`),
    price: safeNumber(item.price?.value),
    currency: safeString(item.price?.currency, 'USD'),
    rating: null,
    reviewCount: 0,
    availability: item.itemWebUrl ? 'Available from seller' : 'Check seller',
    image,
    images,
    specifications: buildSpecsObject(item.localizedAspects),
    reviews: [],
    productUrl: item.itemWebUrl || '',
    sourcePayload: item,
  };
}

function normalizeSerpShoppingItem(item) {
  const title = safeString(item.title, 'Shopping Product');
  const extractedPrice = safeNumber(item.extracted_price);
  return {
    productId: normalizeId('serpapi', item.product_id || item.position || title),
    source: 'serpapi',
    externalId: safeString(item.product_id || item.position || title),
    title,
    description: safeString(item.snippet || item.description || 'Google Shopping result.'),
    category: categoryFromText(title),
    brand: brandFromText(title),
    price: extractedPrice,
    currency: item.price?.includes('₨') ? 'PKR' : item.price?.includes('$') ? 'USD' : 'USD',
    rating: safeNumber(item.rating),
    reviewCount: safeNumber(item.reviews, 0),
    availability: safeString(item.delivery || item.extensions?.join(', '), 'Check seller'),
    image: item.thumbnail || '',
    images: [item.thumbnail].filter(Boolean),
    specifications: {
      source: item.source,
      oldPrice: item.old_price,
      delivery: item.delivery,
      store: item.source,
    },
    reviews: [],
    productUrl: item.link || item.product_link || '',
    sourcePayload: item,
  };
}

function dedupeProducts(products) {
  const map = new Map();
  products.forEach((product) => {
    if (!product || !product.title) return;
    const key = `${product.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60)}_${product.price || 'na'}`;
    if (!map.has(key)) map.set(key, product);
  });
  return Array.from(map.values());
}

function applyFilters(products, filters = {}) {
  const { category, brand, minPrice, maxPrice, sort = 'relevance' } = filters;
  let filtered = [...products];

  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
  }
  if (brand && brand !== 'all') {
    filtered = filtered.filter((p) => p.brand?.toLowerCase().includes(brand.toLowerCase()));
  }
  if (minPrice) filtered = filtered.filter((p) => p.price === null || p.price >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter((p) => p.price === null || p.price <= Number(maxPrice));

  if (sort === 'price-low') filtered.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  if (sort === 'price-high') filtered.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
  if (sort === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (sort === 'reviews') filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));

  return filtered;
}

module.exports = {
  safeString,
  safeNumber,
  normalizeId,
  categoryFromText,
  brandFromText,
  buildSpecsObject,
  normalizeDummyJsonProduct,
  normalizeBestBuyProduct,
  normalizeEbayItem,
  normalizeSerpShoppingItem,
  dedupeProducts,
  applyFilters,
};
