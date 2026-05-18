import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { productApi } from '../services/api';
import ProductCard from './ProductCard';
import './ProductList.css';

const ratingOptions = [
  { label: '4 stars and above', value: 4 },
  { label: '3 stars and above', value: 3 },
  { label: '2 stars and above', value: 2 },
];

function useQueryParams() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

function ProductSkeletonGrid() {
  return (
    <div className="product-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="product-skeleton-card" key={index}>
          <div className="skeleton product-skeleton-image" />
          <div className="skeleton product-skeleton-line wide" />
          <div className="skeleton product-skeleton-line" />
          <div className="skeleton product-skeleton-line short" />
        </div>
      ))}
    </div>
  );
}

function ProductList({ title = 'Product Listing', subtitle, initialQuery = 'laptop', showHero = true }) {
  const navigate = useNavigate();
  const queryParams = useQueryParams();

  const urlSearch = queryParams.get('search') || queryParams.get('q') || '';
  const urlCategory = queryParams.get('category') || 'all';

  const [search, setSearch] = useState(urlSearch || initialQuery);
  const [category, setCategory] = useState(urlCategory);
  const [brand, setBrand] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('relevance');
  const [view, setView] = useState('grid');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearch(urlSearch || initialQuery);
    setCategory(urlCategory);
  }, [urlSearch, urlCategory, initialQuery]);

  useEffect(() => {
    let ignore = false;

    async function loadMeta() {
      try {
        const [categoryResponse, brandResponse] = await Promise.all([
          productApi.getCategories(),
          productApi.getBrands(),
        ]);

        if (!ignore) {
          setCategories(categoryResponse?.categories || []);
          setBrands(brandResponse?.brands || []);
        }
      } catch {
        if (!ignore) {
          setCategories([]);
          setBrands([]);
        }
      }
    }

    loadMeta();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError('');

        const response = await productApi.searchProducts({
          q: search || initialQuery,
          category,
          brand,
          minPrice,
          maxPrice,
          sort,
          limit: 36,
        });

        let items = response?.products || [];

        if (rating) {
          items = items.filter((product) => Number(product.rating || 0) >= Number(rating));
        }

        if (!ignore) {
          setProducts(items);
        }
      } catch (err) {
        if (!ignore) {
          setError('Unable to load products. Please check the backend server or internet connection.');
          setProducts([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [search, category, brand, minPrice, maxPrice, rating, sort, initialQuery]);

  const filteredProducts = useMemo(() => {
    return products;
  }, [products]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set('search', search.trim());
    }

    if (category !== 'all') {
      params.set('category', category);
    }

    navigate(`/products?${params.toString()}`);
  };

  const resetFilters = () => {
    setBrand('all');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSort('relevance');
    setCategory('all');
  };

  const filterContent = (
    <>
      <div className="filter-header">
        <div>
          <h3>Filters</h3>
          <p>Refine DummyJSON products</p>
        </div>
        <button type="button" onClick={resetFilters}>Reset</button>
      </div>

      <div className="filter-group">
        <label htmlFor="category-filter">Category</label>
        <select
          id="category-filter"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item.slug || item.name} value={item.name || item.slug}>
              {item.icon ? `${item.icon} ` : ''}{item.name || item.slug}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="brand-filter">Brand</label>
        <select
          id="brand-filter"
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
        >
          <option value="all">All brands</option>
          {brands.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Price Range</label>
        <div className="filter-price-row">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="rating-filter">Rating</label>
        <select
          id="rating-filter"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
        >
          <option value="">Any rating</option>
          {ratingOptions.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-ai-card">
        <span>🤖</span>
        <strong>AI suggestion</strong>
        <p>Try searching for laptop, smartphone, iphone, headphones, watch or gaming laptop for best DummyJSON results.</p>
      </div>
    </>
  );

  return (
    <section className="products-page">
      {showHero && (
        <div className="products-hero">
          <div className="container">
            <div className="breadcrumb">
              <a href="/">Home</a>
              <span>›</span>
              <span>Products</span>
            </div>

            <div className="products-hero-content">
              <div>
                <span className="section-eyebrow">Dynamic DummyJSON Products</span>
                <h1>{title}</h1>
                <p>
                  {subtitle || 'Browse modern technology products with search, filters, ratings, category chips and cart actions.'}
                </p>
              </div>

              <form className="products-hero-search" onSubmit={handleSearchSubmit}>
                <input
                  type="search"
                  value={search}
                  placeholder="Search iPhone, laptop, gaming, accessories..."
                  onChange={(event) => setSearch(event.target.value)}
                />
                <button type="submit">Search</button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="container products-layout">
        <aside className={filterDrawerOpen ? 'products-filter open' : 'products-filter'}>
          {filterContent}
        </aside>

        <main className="products-main">
          <div className="products-toolbar">
            <div>
              <h2>
                {loading ? 'Loading products...' : `${filteredProducts.length} products found`}
              </h2>
              <p>
                Showing results for <strong>{search || 'technology products'}</strong>
              </p>
            </div>

            <div className="products-toolbar-actions">
              <button
                type="button"
                className="filter-mobile-button"
                onClick={() => setFilterDrawerOpen((value) => !value)}
              >
                Filters
              </button>

              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="relevance">Sort: Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
              </select>

              <div className="view-toggle" aria-label="Toggle product view">
                <button
                  type="button"
                  className={view === 'grid' ? 'active' : ''}
                  onClick={() => setView('grid')}
                >
                  ⊞
                </button>
                <button
                  type="button"
                  className={view === 'list' ? 'active' : ''}
                  onClick={() => setView('list')}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          <div className="search-chip-row">
            {['laptop', 'iphone', 'smartphone', 'gaming laptop', 'watch', 'headphones'].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setSearch(chip);
                  navigate(`/products?search=${encodeURIComponent(chip)}`);
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {error && (
            <div className="products-error">
              <strong>Search failed</strong>
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <ProductSkeletonGrid />
          ) : filteredProducts.length > 0 ? (
            <div className={view === 'list' ? 'product-grid list-view' : 'product-grid'}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id || product.productId} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">⌕</div>
              <h3>No products found</h3>
              <p>Try a simpler keyword such as laptop, smartphone, iphone, watch or headphones.</p>
              <button type="button" className="btn btn-primary" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {filterDrawerOpen && (
        <button
          type="button"
          className="filter-backdrop"
          aria-label="Close filters"
          onClick={() => setFilterDrawerOpen(false)}
        />
      )}
    </section>
  );
}

export default ProductList;