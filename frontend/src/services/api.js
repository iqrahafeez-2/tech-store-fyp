import axios from 'axios';

function normalizeBaseUrl(url) {
  const raw = (url || 'http://localhost:5050/api').replace(/\/+$/, '');
  return raw.endsWith('/api') ? raw : `${raw}/api`;
}

const API_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_API_URL);
const DUMMY_BASE_URL = 'https://dummyjson.com/products';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function svgImage(title = 'Tech Product', color = '#2563eb') {
  const safeTitle = String(title).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="700" height="520" viewBox="0 0 700 520">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#14b8a6" stop-opacity="0.95"/>
        </linearGradient>
      </defs>
      <rect width="700" height="520" rx="36" fill="#f8fafc"/>
      <circle cx="120" cy="92" r="160" fill="${color}" opacity="0.08"/>
      <circle cx="620" cy="430" r="180" fill="#14b8a6" opacity="0.10"/>
      <rect x="150" y="115" width="400" height="250" rx="28" fill="url(#g)"/>
      <rect x="185" y="150" width="330" height="180" rx="18" fill="white" opacity="0.18"/>
      <text x="350" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#0f172a">Tech Store</text>
      <text x="350" y="452" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#475569">${safeTitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const fallbackProducts = [
  {
    id: 'dummyjson_1',
    productId: 'dummyjson_1',
    externalId: '1',
    source: 'dummyjson-local',
    title: 'iPhone Style Premium Smartphone',
    description: 'A premium smartphone style product for Tech Store demo with strong camera, elegant design and smooth performance.',
    category: 'Mobiles',
    rawCategory: 'smartphones',
    brand: 'Apple',
    price: 999,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 128,
    availability: 'In stock',
    stock: 25,
    image: svgImage('Smartphone', '#2563eb'),
    thumbnail: svgImage('Smartphone', '#2563eb'),
    images: [svgImage('Smartphone', '#2563eb'), svgImage('Mobile Camera', '#14b8a6'), svgImage('Phone Display', '#7c3aed')],
    discountPercentage: 10,
    specifications: {
      Brand: 'Apple',
      Category: 'Smartphones',
      SKU: 'TS-PHONE-001',
      Stock: 25,
      Availability: 'In stock',
      Warranty: '1 year standard warranty',
      Shipping: 'Fast delivery available',
      ReturnPolicy: '7 day return policy',
      Display: '6.7 inch OLED display',
      Storage: '256 GB',
      Camera: 'Triple camera system',
    },
    reviews: [
      {
        reviewerName: 'Verified Buyer',
        rating: 5,
        comment: 'Excellent phone with premium feel and very good camera.',
        date: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'dummyjson_2',
    productId: 'dummyjson_2',
    externalId: '2',
    source: 'dummyjson-local',
    title: 'Professional Gaming Laptop',
    description: 'High performance laptop suitable for gaming, coding, designing and multitasking.',
    category: 'Laptops',
    rawCategory: 'laptops',
    brand: 'Asus',
    price: 1499,
    currency: 'USD',
    rating: 4.7,
    reviewCount: 96,
    availability: 'In stock',
    stock: 25,
    image: svgImage('Gaming Laptop', '#7c3aed'),
    thumbnail: svgImage('Gaming Laptop', '#7c3aed'),
    images: [svgImage('Gaming Laptop', '#7c3aed'), svgImage('Laptop Keyboard', '#2563eb'), svgImage('Laptop Performance', '#14b8a6')],
    discountPercentage: 15,
    specifications: {
      Brand: 'Asus',
      Category: 'Laptops',
      SKU: 'TS-LAP-002',
      Stock: 25,
      Availability: 'In stock',
      Warranty: '1 year standard warranty',
      Processor: 'Intel Core i7 style processor',
      RAM: '16 GB',
      Storage: '1 TB SSD',
      GPU: 'Dedicated gaming graphics',
    },
    reviews: [
      {
        reviewerName: 'Verified Buyer',
        rating: 5,
        comment: 'Powerful laptop for gaming and study work.',
        date: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'dummyjson_3',
    productId: 'dummyjson_3',
    externalId: '3',
    source: 'dummyjson-local',
    title: 'Wireless Noise Cancelling Headphones',
    description: 'Comfortable wireless headphones with long battery life and clear audio quality.',
    category: 'Accessories',
    rawCategory: 'mobile-accessories',
    brand: 'Sony',
    price: 199,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 74,
    availability: 'In stock',
    stock: 25,
    image: svgImage('Headphones', '#0f766e'),
    thumbnail: svgImage('Headphones', '#0f766e'),
    images: [svgImage('Headphones', '#0f766e'), svgImage('Audio Device', '#2563eb')],
    discountPercentage: 8,
    specifications: {
      Brand: 'Sony',
      Category: 'Accessories',
      SKU: 'TS-AUD-003',
      Stock: 25,
      Availability: 'In stock',
      Warranty: '1 year standard warranty',
      Battery: 'Up to 30 hours',
      Connectivity: 'Bluetooth',
      Feature: 'Noise cancellation',
    },
    reviews: [],
  },
  {
    id: 'dummyjson_4',
    productId: 'dummyjson_4',
    externalId: '4',
    source: 'dummyjson-local',
    title: 'Smart Watch Fitness Edition',
    description: 'Smart wearable device with health tracking, notifications and long battery life.',
    category: 'Smart Devices',
    rawCategory: 'mens-watches',
    brand: 'Samsung',
    price: 249,
    currency: 'USD',
    rating: 4.5,
    reviewCount: 52,
    availability: 'In stock',
    stock: 25,
    image: svgImage('Smart Watch', '#0891b2'),
    thumbnail: svgImage('Smart Watch', '#0891b2'),
    images: [svgImage('Smart Watch', '#0891b2'), svgImage('Fitness Tracker', '#14b8a6')],
    discountPercentage: 12,
    specifications: {
      Brand: 'Samsung',
      Category: 'Smart Devices',
      SKU: 'TS-WATCH-004',
      Stock: 25,
      Availability: 'In stock',
      Warranty: '1 year standard warranty',
      Battery: 'Long battery life',
      Sensors: 'Heart rate and fitness tracking',
      Connectivity: 'Bluetooth',
    },
    reviews: [],
  },
  {
    id: 'dummyjson_5',
    productId: 'dummyjson_5',
    externalId: '5',
    source: 'dummyjson-local',
    title: 'RGB Gaming Mouse',
    description: 'Responsive gaming mouse with ergonomic grip, RGB lighting and precision sensor.',
    category: 'Gaming',
    rawCategory: 'gaming-accessories',
    brand: 'Logitech',
    price: 59,
    currency: 'USD',
    rating: 4.4,
    reviewCount: 61,
    availability: 'In stock',
    stock: 25,
    image: svgImage('Gaming Mouse', '#dc2626'),
    thumbnail: svgImage('Gaming Mouse', '#dc2626'),
    images: [svgImage('Gaming Mouse', '#dc2626'), svgImage('RGB Mouse', '#7c3aed')],
    discountPercentage: 18,
    specifications: {
      Brand: 'Logitech',
      Category: 'Gaming',
      SKU: 'TS-MOUSE-005',
      Stock: 25,
      Availability: 'In stock',
      DPI: 'Adjustable DPI',
      Lighting: 'RGB lighting',
      Warranty: '1 year standard warranty',
    },
    reviews: [],
  },
  {
    id: 'dummyjson_6',
    productId: 'dummyjson_6',
    externalId: '6',
    source: 'dummyjson-local',
    title: 'Ultra HD Professional Monitor',
    description: 'Large display monitor for work, gaming and entertainment with sharp visuals.',
    category: 'Computer Hardware',
    rawCategory: 'monitors',
    brand: 'Dell',
    price: 349,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 83,
    availability: 'In stock',
    stock: 25,
    image: svgImage('Monitor', '#334155'),
    thumbnail: svgImage('Monitor', '#334155'),
    images: [svgImage('Monitor', '#334155'), svgImage('Ultra HD Display', '#2563eb')],
    discountPercentage: 9,
    specifications: {
      Brand: 'Dell',
      Category: 'Computer Hardware',
      SKU: 'TS-MON-006',
      Stock: 25,
      Availability: 'In stock',
      Display: 'Ultra HD display',
      RefreshRate: 'High refresh rate',
      Warranty: '1 year standard warranty',
    },
    reviews: [],
  },
];

function getCleanProductId(productId) {
  return String(productId || '')
    .replace('dummyjson_', '')
    .replace('dummy_', '')
    .replace(/[^0-9]/g, '');
}

function mapDummyCategory(category = '') {
  const text = String(category).toLowerCase();

  if (text.includes('mobile') || text.includes('phone')) return 'smartphones';
  if (text.includes('laptop') || text.includes('gaming') || text.includes('hardware')) return 'laptops';
  if (text.includes('access')) return 'mobile-accessories';
  if (text.includes('smart') || text.includes('watch')) return 'mens-watches';

  return '';
}

function inferCategory(item) {
  const text = `${item.category || ''} ${item.title || ''}`.toLowerCase();

  if (/phone|smartphone|iphone|galaxy|mobile/.test(text)) return 'Mobiles';
  if (/laptop|notebook|macbook|zenbook|matebook/.test(text)) return 'Laptops';
  if (/watch|smart/.test(text)) return 'Smart Devices';
  if (/charger|accessor|case|cable|headphone|earbuds/.test(text)) return 'Accessories';
  if (/gaming|playstation|xbox|controller|mouse/.test(text)) return 'Gaming';
  if (/monitor|hardware|computer/.test(text)) return 'Computer Hardware';

  return 'Technology';
}

function normalizeDummyProduct(item) {
  const images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
  const stock = Number(item.stock || 0) > 0 ? Number(item.stock) : 25;

  return {
    id: `dummyjson_${item.id}`,
    productId: `dummyjson_${item.id}`,
    externalId: String(item.id),
    source: 'dummyjson',
    title: item.title || 'Untitled Product',
    description: item.description || 'No description available.',
    category: inferCategory(item),
    rawCategory: item.category || 'technology',
    brand: item.brand || 'Tech Brand',
    price: Number(item.price || 0),
    currency: 'USD',
    rating: Number(item.rating || 4.5),
    reviewCount: Array.isArray(item.reviews)
      ? item.reviews.length
      : Math.max(1, Math.round(Number(item.rating || 4.5) * 12)),
    availability: 'In stock',
    stock,
    image: images[0] || item.thumbnail || svgImage(item.title || 'Tech Product'),
    thumbnail: item.thumbnail || images[0] || svgImage(item.title || 'Tech Product'),
    images: images.length ? images : [item.thumbnail || svgImage(item.title || 'Tech Product')],
    discountPercentage: Number(item.discountPercentage || 0),
    specifications: {
      Brand: item.brand || 'Tech Brand',
      Category: item.category || 'Technology',
      SKU: item.sku || `TS-${item.id}`,
      Stock: stock,
      Availability: 'In stock',
      Warranty: item.warrantyInformation || 'Standard warranty',
      Shipping: item.shippingInformation || 'Standard shipping',
      ReturnPolicy: item.returnPolicy || 'Return policy available',
      Weight: item.weight || 'Not specified',
      Dimensions: item.dimensions
        ? `${item.dimensions.width} × ${item.dimensions.height} × ${item.dimensions.depth}`
        : 'Not specified',
      MinimumOrderQuantity: item.minimumOrderQuantity || 1,
    },
    reviews: Array.isArray(item.reviews) ? item.reviews : [],
    productUrl: '',
    sourcePayload: item,
  };
}

function sortProducts(products, sort = 'relevance') {
  const sorted = [...products];

  if (sort === 'price-low') sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sort === 'price-high') sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
  if (sort === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (sort === 'reviews') sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));

  return sorted;
}

function localFallbackSearch(params = {}) {
  const q = String(params.q || params.search || '').toLowerCase();
  const limit = Number(params.limit || 24);

  let products = fallbackProducts;

  if (q) {
    const filtered = fallbackProducts.filter((product) => {
      const text = `${product.title} ${product.description} ${product.category} ${product.brand} ${product.rawCategory}`.toLowerCase();
      return text.includes(q) || q.split(/\s+/).some((word) => text.includes(word));
    });

    products = filtered.length ? filtered : fallbackProducts;
  }

  if (params.category && params.category !== 'all') {
    const categoryText = String(params.category).toLowerCase();
    const filtered = products.filter((product) => product.category.toLowerCase().includes(categoryText));
    products = filtered.length ? filtered : products;
  }

  if (params.brand && params.brand !== 'all') {
    const brandText = String(params.brand).toLowerCase();
    const filtered = products.filter((product) => product.brand.toLowerCase().includes(brandText));
    products = filtered.length ? filtered : products;
  }

  if (params.minPrice) {
    products = products.filter((product) => product.price >= Number(params.minPrice));
  }

  if (params.maxPrice) {
    products = products.filter((product) => product.price <= Number(params.maxPrice));
  }

  products = sortProducts(products, params.sort).slice(0, limit);

  return {
    success: true,
    query: params.q || params.search || 'local fallback',
    count: products.length,
    products,
    providersUsed: ['local-fallback'],
    cache: 'local',
    notice: 'Network unavailable. Showing local Tech Store fallback products.',
  };
}

async function directDummySearch(params = {}) {
  try {
    const q = params.q || params.search || 'laptop';
    const limit = Number(params.limit || 24);
    const categorySlug =
      params.category && params.category !== 'all' ? mapDummyCategory(params.category) : '';

    const url = categorySlug
      ? `${DUMMY_BASE_URL}/category/${encodeURIComponent(categorySlug)}?limit=${limit}`
      : `${DUMMY_BASE_URL}/search?q=${encodeURIComponent(q)}&limit=${limit}`;

    let response = await axios.get(url, {
      timeout: 15000,
    });

    let products = Array.isArray(response.data.products) ? response.data.products : [];

    if (products.length === 0) {
      response = await axios.get(`${DUMMY_BASE_URL}/category/laptops?limit=${limit}`, {
        timeout: 15000,
      });

      products = Array.isArray(response.data.products) ? response.data.products : [];
    }

    let normalized = products.map(normalizeDummyProduct);

    if (params.brand && params.brand !== 'all') {
      normalized = normalized.filter((product) =>
        product.brand.toLowerCase().includes(String(params.brand).toLowerCase())
      );
    }

    if (params.minPrice) {
      normalized = normalized.filter((product) => product.price >= Number(params.minPrice));
    }

    if (params.maxPrice) {
      normalized = normalized.filter((product) => product.price <= Number(params.maxPrice));
    }

    normalized = sortProducts(normalized, params.sort).slice(0, limit);

    return {
      success: true,
      query: q,
      count: normalized.length,
      products: normalized.length ? normalized : localFallbackSearch(params).products,
      providersUsed: ['dummyjson-direct'],
      cache: 'direct-dummyjson',
      notice: 'Loaded dynamically from DummyJSON API.',
    };
  } catch (error) {
    console.warn('DummyJSON direct search failed. Using local fallback.', error.message);
    return localFallbackSearch(params);
  }
}

async function directDummyProduct(productId) {
  const id = getCleanProductId(productId);

  const localProduct = fallbackProducts.find((product) => getCleanProductId(product.id) === id);

  try {
    if (!id) {
      throw new Error('Invalid DummyJSON product ID');
    }

    const { data } = await axios.get(`${DUMMY_BASE_URL}/${id}`, {
      timeout: 15000,
    });

    return {
      success: true,
      product: normalizeDummyProduct(data),
    };
  } catch (error) {
    console.warn('DummyJSON direct product failed. Using local fallback.', error.message);

    return {
      success: true,
      product: localProduct || fallbackProducts[0],
      fallback: true,
    };
  }
}

export const productApi = {
  searchProducts: async (params = {}) => {
    const safeParams = {
      q: params.q || params.search || 'laptop',
      category: params.category || 'all',
      brand: params.brand || 'all',
      minPrice: params.minPrice || '',
      maxPrice: params.maxPrice || '',
      sort: params.sort || 'relevance',
      limit: params.limit || 24,
    };

    try {
      const { data } = await apiClient.get('/products/search', {
        params: safeParams,
      });

      if (data?.products?.length) {
        return {
          ...data,
          products: data.products.map((product) => ({
            ...product,
            stock: Number(product.stock || 0) > 0 ? Number(product.stock) : 25,
            availability: 'In stock',
          })),
        };
      }

      return directDummySearch(safeParams);
    } catch (error) {
      console.warn('Backend product search failed. Using DummyJSON safe fallback.', error.message);
      return directDummySearch(safeParams);
    }
  },

  getProduct: async (productId) => {
    try {
      const { data } = await apiClient.get(`/products/${encodeURIComponent(productId)}`);

      if (data?.product) {
        return {
          ...data,
          product: {
            ...data.product,
            id: data.product.id || data.product.productId || productId,
            productId: data.product.productId || data.product.id || productId,
            stock: Number(data.product.stock || 0) > 0 ? Number(data.product.stock) : 25,
            availability: 'In stock',
          },
        };
      }

      return directDummyProduct(productId);
    } catch (error) {
      console.warn('Backend product detail failed. Using DummyJSON safe fallback.', error.message);
      return directDummyProduct(productId);
    }
  },

  getTrending: async (limit = 12) => {
    try {
      const { data } = await apiClient.get('/products/trending', {
        params: { limit },
      });

      if (data?.products?.length) {
        return {
          ...data,
          products: data.products.map((product) => ({
            ...product,
            stock: Number(product.stock || 0) > 0 ? Number(product.stock) : 25,
            availability: 'In stock',
          })),
        };
      }

      return directDummySearch({ q: 'laptop', limit, sort: 'rating' });
    } catch {
      return directDummySearch({ q: 'laptop', limit, sort: 'rating' });
    }
  },

  getSuggestions: async (q = '') => {
    try {
      const { data } = await apiClient.get('/products/suggestions', {
        params: { q },
      });

      return data;
    } catch {
      const defaults = [
        'iphone',
        'laptop',
        'smartphone',
        'gaming laptop',
        'headphones',
        'smart watch',
        'camera phone',
        'apple products',
      ];

      return {
        success: true,
        suggestions: defaults.filter((item) => !q || item.includes(String(q).toLowerCase())),
      };
    }
  },

  getCategories: async () => {
    try {
      const { data } = await apiClient.get('/products/categories');
      return data;
    } catch {
      return {
        success: true,
        categories: [
          { name: 'Mobiles', slug: 'smartphones', icon: '📱', count: 0 },
          { name: 'Laptops', slug: 'laptops', icon: '💻', count: 0 },
          { name: 'Accessories', slug: 'mobile-accessories', icon: '🔌', count: 0 },
          { name: 'Gaming', slug: 'laptops', icon: '🎮', count: 0 },
          { name: 'Smart Devices', slug: 'mens-watches', icon: '⌚', count: 0 },
          { name: 'Computer Hardware', slug: 'laptops', icon: '🧩', count: 0 },
        ],
      };
    }
  },

  getBrands: async (q = '') => {
    try {
      const { data } = await apiClient.get('/products/brands', {
        params: { q },
      });

      return data;
    } catch {
      return {
        success: true,
        brands: ['Apple', 'Samsung', 'Huawei', 'Oppo', 'Asus', 'Lenovo', 'Dell', 'HP'].filter(
          (brand) => !q || brand.toLowerCase().includes(q.toLowerCase())
        ),
      };
    }
  },

  getRecommendations: async (payload = {}) => {
    try {
      const { data } = await apiClient.post('/products/recommendations', payload);

      if (data?.products?.length) {
        return data;
      }

      return directDummySearch({
        q: payload.query || payload.usage || 'laptop',
        sort: 'rating',
        limit: 8,
      });
    } catch {
      return directDummySearch({
        q: payload.query || payload.usage || 'laptop',
        sort: 'rating',
        limit: 8,
      });
    }
  },

  getProviderStatus: async () => {
    try {
      const { data } = await apiClient.get('/products/providers');
      return data;
    } catch {
      return {
        success: true,
        providers: {
          dummyjson: true,
          backend: false,
          localFallback: true,
        },
      };
    }
  },
};

export const aiApi = {
  chat: async (message, products = []) => {
    try {
      const { data } = await apiClient.post('/ai/chat', {
        message,
        products,
      });

      return data;
    } catch {
      return {
        reply:
          'I can help you find products, compare specifications, track orders, and choose the best technology item for your budget.',
        suggestions: [],
      };
    }
  },

  suggest: async (query) => ({
    suggestions: ['laptop', 'smartphone', 'gaming laptop', 'headphones', 'apple products'].filter((item) =>
      item.includes(String(query || '').toLowerCase())
    ),
  }),

  sentiment: async (reviews = []) => ({
    success: true,
    sentiment: {
      positive: 78,
      neutral: 15,
      negative: 7,
    },
    reviews,
  }),
};

export default apiClient;