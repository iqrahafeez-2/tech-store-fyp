import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import ProductCard from '../components/ProductCard';
import Chatbot from '../components/Chatbot';
import { productApi } from '../services/api';

import './Home.css';

const heroSearches = [
  'laptop',
  'iphone',
  'smartphone',
  'gaming laptop',
  'headphones',
  'watch',
];

const categoryCards = [
  {
    name: 'Laptops',
    query: 'laptop',
    icon: '💻',
    description: 'Work, study and gaming laptops with premium features.',
  },
  {
    name: 'Mobiles',
    query: 'smartphone',
    icon: '📱',
    description: 'Latest smartphones, iPhones and Android devices.',
  },
  {
    name: 'Gaming',
    query: 'gaming laptop',
    icon: '🎮',
    description: 'Gaming laptops, performance devices and accessories.',
  },
  {
    name: 'Accessories',
    query: 'headphones',
    icon: '🔌',
    description: 'Headphones, chargers, cases and useful add ons.',
  },
  {
    name: 'Smart Devices',
    query: 'watch',
    icon: '⌚',
    description: 'Smart wearables and connected lifestyle devices.',
  },
  {
    name: 'Computer Hardware',
    query: 'monitor',
    icon: '🧩',
    description: 'High performance tech products and hardware essentials.',
  },
];

function HomeSkeleton() {
  return (
    <div className="home-product-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="home-skeleton-card" key={index}>
          <div className="skeleton home-skeleton-image" />
          <div className="skeleton home-skeleton-line wide" />
          <div className="skeleton home-skeleton-line" />
          <div className="skeleton home-skeleton-line short" />
        </div>
      ))}
    </div>
  );
}

function Home() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [trending, setTrending] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('02:14:38');

  useEffect(() => {
    let ignore = false;

    async function loadHomeProducts() {
      setLoading(true);

      const results = await Promise.allSettled([
        productApi.getTrending(8),
        productApi.searchProducts({
          q: 'laptop',
          sort: 'rating',
          limit: 8,
        }),
      ]);

      if (!ignore) {
        const trendingResponse = results[0].status === 'fulfilled' ? results[0].value : null;
        const bestResponse = results[1].status === 'fulfilled' ? results[1].value : null;

        setTrending(trendingResponse?.products || []);
        setBestSellers(bestResponse?.products || []);
        setLoading(false);
      }
    }

    loadHomeProducts();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const endTime =
      Date.now() +
      2 * 60 * 60 * 1000 +
      14 * 60 * 1000 +
      38 * 1000;

    const timer = setInterval(() => {
      const difference = Math.max(0, endTime - Date.now());

      const hours = Math.floor(difference / 3600000);
      const minutes = Math.floor((difference % 3600000) / 60000);
      const seconds = Math.floor((difference % 60000) / 1000);

      setCountdown(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
          2,
          '0'
        )}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const cleanSearch = search.trim();

    if (cleanSearch) {
      navigate(`/products?search=${encodeURIComponent(cleanSearch)}`);
    } else {
      navigate('/products');
    }
  };

  const handleQuickSearch = (query) => {
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const featuredProducts = bestSellers.length > 0 ? bestSellers : trending;

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="container home-hero-grid">
          <div className="home-hero-copy">
            <span className="section-eyebrow">AI Powered Tech Commerce</span>

            <h1>Find the right technology product faster.</h1>

            <p>
              Tech Store combines modern e commerce design with DummyJSON dynamic
              products, smart suggestions, clean filters, cart actions and AI
              style recommendations for your final year project.
            </p>

            <form className="home-hero-search" onSubmit={handleSearchSubmit}>
              <span>⌕</span>

              <input
                type="search"
                value={search}
                placeholder="Search laptops, mobiles, accessories..."
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search products"
              />

              <button type="submit">Search Products</button>
            </form>

            <div className="home-search-chips">
              {heroSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleQuickSearch(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="home-hero-actions">
              <Link to="/products" className="btn btn-primary">
                Shop Now
              </Link>

              <Link to="/ai-recommendations" className="btn btn-secondary">
                Ask AI Assistant
              </Link>
            </div>

            <div className="home-trust-row">
              <span>🔒 Secure checkout</span>
              <span>🚚 Fast delivery</span>
              <span>⭐ Rated products</span>
            </div>
          </div>

          <div className="home-hero-panel">
            <div className="home-hero-panel-top">
              <span>Live product preview</span>
              <strong>DummyJSON API</strong>
            </div>

            <div className="home-device-card">
              <div className="home-device-glow" />

              <div className="home-device-screen">
                <div className="home-device-camera" />

                <div className="home-device-content">
                  <span>AI Smart Picks</span>

                  <strong>
                    {trending[0]?.title || 'Premium Tech Product'}
                  </strong>

                  <p>
                    {trending[0]?.description ||
                      'Dynamic products are loaded from DummyJSON API with a safe local fallback.'}
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate('/products?search=laptop')}
                  >
                    Explore
                  </button>
                </div>
              </div>
            </div>

            <div className="home-hero-stats">
              <div>
                <strong>100+</strong>
                <span>Dynamic products</span>
              </div>

              <div>
                <strong>24/7</strong>
                <span>AI help</span>
              </div>

              <div>
                <strong>6</strong>
                <span>Main categories</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-ai-strip">
        <div className="container">
          <div className="home-ai-strip-inner">
            <div>
              <span>🤖 AI Smart Suggestions</span>
              <strong>Based on trending searches and user behavior</strong>
            </div>

            <div className="home-ai-chips">
              {heroSearches.slice(0, 5).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleQuickSearch(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="home-section-header">
            <div>
              <span className="section-eyebrow">Featured Categories</span>
              <h2>Browse by technology type</h2>
              <p>
                Recognizable category cards help users find products without
                remembering exact names.
              </p>
            </div>

            <Link to="/categories" className="btn btn-secondary">
              View All Categories
            </Link>
          </div>

          <div className="home-category-grid">
            {categoryCards.map((category) => (
              <button
                type="button"
                className="home-category-card"
                key={category.name}
                onClick={() => handleQuickSearch(category.query)}
              >
                <span>{category.icon}</span>
                <strong>{category.name}</strong>
                <p>{category.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section home-products-section">
        <div className="container">
          <div className="home-section-header">
            <div>
              <span className="section-eyebrow">Best Selling Products</span>
              <h2>Premium product cards</h2>
              <p>
                Images, price, ratings, brand, stock status and add to cart
                actions are shown clearly.
              </p>
            </div>

            <Link to="/products?search=laptop" className="btn btn-primary">
              Explore Products
            </Link>
          </div>

          {loading ? (
            <HomeSkeleton />
          ) : (
            <div className="home-product-grid">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id || product.productId}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="home-deals-section">
        <div className="container">
          <div className="home-deals-card">
            <div>
              <span className="section-eyebrow">Flash Offers</span>
              <h2>Limited technology deals</h2>
              <p>
                Countdown and discount badges improve visibility of system status
                and conversion clarity.
              </p>
            </div>

            <div className="home-countdown">
              <span>Ends in</span>
              <strong>{countdown}</strong>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/deals')}
            >
              View Deals
            </button>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="home-section-header">
            <div>
              <span className="section-eyebrow">Why Choose Tech Store</span>
              <h2>Engineered with AI-powered features and modern web technologies.</h2>
              <p>
               Delivering a seamless shopping experience through intelligent recommendations, responsive design, and optimized performance.
              </p>
            </div>
          </div>

          <div className="home-benefits-grid">
            <div className="home-benefit-card">
              <span>🔎</span>
              <strong>Smart Search</strong>
              <p>
                Search bar and suggestions guide the user toward products
                quickly.
              </p>
            </div>

            <div className="home-benefit-card">
              <span>🛒</span>
              <strong>Working Cart</strong>
              <p>
                Add, update, remove and review products before checkout.
              </p>
            </div>

            <div className="home-benefit-card">
              <span>🤖</span>
              <strong>AI Style Help</strong>
              <p>
                Chatbot, recommendations and explanation labels support
                decisions.
              </p>
            </div>

            <div className="home-benefit-card">
              <span>📱</span>
              <strong>Responsive UI</strong>
              <p>
                Mobile first layout with sticky navbar and bottom navigation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;