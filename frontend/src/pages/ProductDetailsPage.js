import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { productApi } from '../services/api';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

import './ProductDetailsPage.css';

const productCache = new Map();
const relatedCache = new Map();

function formatPrice(price, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(price || 0));
}

function getAlwaysInStockValue(product) {
  const directStock = Number(product?.stock);
  const specStock = Number(product?.specifications?.stock || product?.specifications?.Stock);

  if (Number.isFinite(directStock) && directStock > 0) {
    return directStock;
  }

  if (Number.isFinite(specStock) && specStock > 0) {
    return specStock;
  }

  return 25;
}

function normalizeProduct(product, fallbackId) {
  if (!product) {
    return null;
  }

  const id = product.id || product.productId || fallbackId;
  const stock = getAlwaysInStockValue(product);

  return {
    ...product,
    id,
    productId: product.productId || id,
    stock,
    availability: 'In stock',
    rating: Number(product.rating || 4.5),
    image: product.image || product.thumbnail || product.images?.[0] || '',
    images: Array.isArray(product.images) ? product.images : [product.image || product.thumbnail].filter(Boolean),
    category: product.category || 'Technology',
    brand: product.brand || 'Tech Brand',
    specifications: {
      ...(product.specifications || {}),
      Brand: product.specifications?.Brand || product.brand || 'Tech Brand',
      Category: product.specifications?.Category || product.rawCategory || product.category || 'Technology',
      Stock: stock,
      Availability: 'In stock',
    },
  };
}

function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    addRecentlyViewed,
    showToast,
  } = useStore();

  const requestIdRef = useRef(0);
  const viewedProductRef = useRef('');

  const cachedProduct = productCache.get(productId);

  const [product, setProduct] = useState(cachedProduct || null);
  const [relatedProducts, setRelatedProducts] = useState(relatedCache.get(productId) || []);
  const [activeImage, setActiveImage] = useState(cachedProduct?.image || cachedProduct?.images?.[0] || '');
  const [activeTab, setActiveTab] = useState('overview');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(!cachedProduct);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState('');

  const currentProductId = product?.id || product?.productId || productId;
  const stock = getAlwaysInStockValue(product);
  const saved = product ? isInWishlist(currentProductId) : false;

  const fixedProduct = product
    ? {
        ...product,
        id: currentProductId,
        productId: product.productId || currentProductId,
        stock,
        availability: 'In stock',
      }
    : null;

  const productImages = useMemo(() => {
    if (!product) {
      return [];
    }

    const images = [
      product.image,
      product.thumbnail,
      ...(Array.isArray(product.images) ? product.images : []),
    ].filter(Boolean);

    return [...new Set(images)];
  }, [product]);

  useEffect(() => {
    if (!productId) {
      setError('Invalid product URL.');
      setLoading(false);
      return undefined;
    }

    const cached = productCache.get(productId);
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let cancelled = false;

    if (cached) {
      setProduct(cached);
      setActiveImage(cached.image || cached.thumbnail || cached.images?.[0] || '');
      setError('');
      setLoading(false);
    } else {
      setLoading(true);
      setError('');
    }

    async function loadProduct() {
      try {
        const response = await productApi.getProduct(productId);
        const foundProduct = response?.product || response?.data || response;
        const normalized = normalizeProduct(foundProduct, productId);

        if (!normalized || !normalized.title) {
          throw new Error('Product not found');
        }

        productCache.set(productId, normalized);

        if (!cancelled && requestIdRef.current === requestId) {
          setProduct(normalized);
          setActiveImage((current) => current || normalized.image || normalized.thumbnail || normalized.images?.[0] || '');
          setError('');
          setLoading(false);
        }
      } catch {
        if (!cancelled && requestIdRef.current === requestId) {
          setError('Product details could not be loaded. Please check the product link or try again.');
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (!product || !currentProductId) {
      return;
    }

    if (viewedProductRef.current === currentProductId) {
      return;
    }

    viewedProductRef.current = currentProductId;
    addRecentlyViewed(product);
  }, [product, currentProductId, addRecentlyViewed]);

  useEffect(() => {
    if (!product || !currentProductId) {
      return undefined;
    }

    const cacheKey = currentProductId;
    const cachedRelated = relatedCache.get(cacheKey);

    if (cachedRelated) {
      setRelatedProducts(cachedRelated);
      setRelatedLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadRelatedProducts() {
      try {
        setRelatedLoading(true);

        const response = await productApi.searchProducts({
          q: product.rawCategory || product.category || product.brand || 'laptop',
          limit: 8,
          sort: 'rating',
        });

        const items = (response?.products || [])
          .map((item) => normalizeProduct(item, item.id || item.productId))
          .filter(Boolean)
          .filter((item) => (item.id || item.productId) !== currentProductId)
          .slice(0, 4);

        relatedCache.set(cacheKey, items);

        if (!cancelled) {
          setRelatedProducts(items);
        }
      } catch {
        if (!cancelled) {
          setRelatedProducts([]);
        }
      } finally {
        if (!cancelled) {
          setRelatedLoading(false);
        }
      }
    }

    loadRelatedProducts();

    return () => {
      cancelled = true;
    };
  }, [product, currentProductId]);

  useEffect(() => {
    if (productImages.length > 0 && !productImages.includes(activeImage)) {
      setActiveImage(productImages[0]);
    }
  }, [productImages, activeImage]);

  const handleAddToCart = () => {
    if (!fixedProduct) {
      showToast('Product is not available', 'error');
      return;
    }

    addToCart(fixedProduct, quantity);
  };

  const handleBuyNow = () => {
    if (!fixedProduct) {
      showToast('Product is not available', 'error');
      return;
    }

    addToCart(fixedProduct, quantity);
    navigate('/cart');
  };

  if (loading && !product) {
    return (
      <main className="product-detail-page">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <Link to="/products">Products</Link>
            <span>›</span>
            <span>Loading</span>
          </div>

          <div className="product-detail-skeleton">
            <div className="skeleton detail-skeleton-gallery" />
            <div>
              <div className="skeleton detail-skeleton-line wide" />
              <div className="skeleton detail-skeleton-line" />
              <div className="skeleton detail-skeleton-line short" />
              <div className="skeleton detail-skeleton-actions" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !product) {
    return (
      <main className="product-detail-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>Product not found</h3>
            <p>{error}</p>
            <Link to="/products" className="btn btn-primary">
              Back to Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  const discount = Number(product.discountPercentage || 0);
  const oldPrice = discount > 0 ? Number(product.price || 0) / (1 - discount / 100) : null;
  const specs = product.specifications || {};
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];

  return (
    <main className="product-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/products">Products</Link>
          <span>›</span>
          <span>{product.title}</span>
        </div>

        <section className={loading ? 'product-detail-grid detail-refreshing' : 'product-detail-grid'}>
          <div className="product-gallery-card">
            <div className="product-main-image">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.title}
                  onError={(event) => {
                    event.currentTarget.src =
                      'https://dummyjson.com/image/600x400/eeeeee/111111?text=Tech+Store';
                  }}
                />
              ) : (
                <div className="no-image">No image available</div>
              )}

              <div className="detail-image-badges">
                <span>DummyJSON</span>
                {discount > 0 && <strong>-{Math.round(discount)}%</strong>}
              </div>
            </div>

            <div className="product-thumb-row">
              {productImages.slice(0, 6).map((image) => (
                <button
                  type="button"
                  key={image}
                  className={activeImage === image ? 'active' : ''}
                  onClick={() => setActiveImage(image)}
                  aria-label="Change product image"
                >
                  <img src={image} alt={`${product.title} thumbnail`} />
                </button>
              ))}
            </div>
          </div>

          <div className="product-info-card">
            <div className="product-info-top">
              <span className="badge badge-primary">{product.category || 'Technology'}</span>
              <span className="badge badge-success">In Stock {stock}</span>
            </div>

            <h1>{product.title}</h1>

            <div className="detail-rating-row">
              <span className="detail-stars">
                {'★'.repeat(Math.max(1, Math.round(product.rating || 4.5))).slice(0, 5)}
                <small>
                  {'☆'.repeat(Math.max(0, 5 - Math.round(product.rating || 4.5))).slice(0, 5)}
                </small>
              </span>
              <strong>{Number(product.rating || 4.5).toFixed(1)}</strong>
              <span>({product.reviewCount || reviews.length || 24} reviews)</span>
            </div>

            <p className="detail-description">{product.description}</p>

            <div className="detail-price-row">
              <div>
                <strong>{formatPrice(product.price, product.currency || 'USD')}</strong>
                {oldPrice && <span>{formatPrice(oldPrice, product.currency || 'USD')}</span>}
              </div>

              <button
                type="button"
                className={saved ? 'detail-wishlist active' : 'detail-wishlist'}
                onClick={() => toggleWishlist(fixedProduct)}
              >
                {saved ? '♥ Saved' : '♡ Wishlist'}
              </button>
            </div>

            <div className="detail-option-card">
              <div>
                <strong>Quantity</strong>
                <span>Choose quantity before adding to cart</span>
              </div>

              <div className="detail-quantity">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.min(stock, value + 1))}
                >
                  +
                </button>
              </div>
            </div>

            <div className="detail-action-row">
              <button type="button" className="btn btn-primary" onClick={handleAddToCart}>
                Add to Cart
              </button>

              <button type="button" className="btn btn-secondary" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>

            <div className="detail-trust-grid">
              <div>🔒 Secure checkout</div>
              <div>🚚 Fast delivery</div>
              <div>🔄 Easy returns</div>
              <div>🛡️ Standard warranty</div>
            </div>
          </div>
        </section>

        <section className="detail-tabs-section">
          <div className="detail-tabs">
            {['overview', 'specifications', 'reviews', 'ai'].map((tab) => (
              <button
                type="button"
                key={tab}
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'ai' ? 'AI Summary' : tab}
              </button>
            ))}
          </div>

          <div className="detail-tab-content">
            {activeTab === 'overview' && (
              <div className="detail-overview">
                <h2>Product Overview</h2>
                <p>{product.description}</p>

                <div className="detail-overview-grid">
                  <div>
                    <span>Brand</span>
                    <strong>{product.brand || 'Tech Brand'}</strong>
                  </div>
                  <div>
                    <span>Category</span>
                    <strong>{product.category || 'Technology'}</strong>
                  </div>
                  <div>
                    <span>Availability</span>
                    <strong>In stock</strong>
                  </div>
                  <div>
                    <span>Source</span>
                    <strong>DummyJSON API</strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="detail-spec-table">
                {Object.entries(specs).length > 0 ? (
                  Object.entries(specs).map(([key, value]) => (
                    <div key={key}>
                      <span>{key}</span>
                      <strong>{String(value || 'Not available')}</strong>
                    </div>
                  ))
                ) : (
                  <p>No detailed specifications are available for this DummyJSON product.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="detail-reviews">
                <div className="review-summary-card">
                  <strong>{Number(product.rating || 4.5).toFixed(1)}</strong>
                  <span>Average rating</span>
                  <p>AI sentiment summary: mostly positive based on rating and review tone.</p>
                </div>

                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <article className="review-card" key={`${review.reviewerName || 'user'}-${index}`}>
                      <div>
                        <strong>{review.reviewerName || 'Verified Buyer'}</strong>
                        <span>
                          {review.date ? new Date(review.date).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p>{review.comment || 'Good product experience.'}</p>
                      <small>{'★'.repeat(Math.round(review.rating || 4))}</small>
                    </article>
                  ))
                ) : (
                  <article className="review-card">
                    <div>
                      <strong>Verified Buyer</strong>
                      <span>Recent</span>
                    </div>
                    <p>This product has good value, clear images and useful information for comparison.</p>
                    <small>★★★★★</small>
                  </article>
                )}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="detail-ai-box">
                <span>🤖</span>
                <div>
                  <h2>AI Product Summary</h2>
                  <p>
                    This product is suitable for users searching for {product.category || 'technology'} products.
                    It is from {product.brand || 'a known brand'}, has a rating of{' '}
                    {Number(product.rating || 4.5).toFixed(1)}, and is currently available in stock.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate(`/ai-recommendations?query=${encodeURIComponent(product.title)}`)}
                  >
                    Get Similar AI Picks
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="related-section">
          <div className="home-section-header">
            <div>
              <span className="section-eyebrow">Related Products</span>
              <h2>You may also like</h2>
              <p>Related products are fetched dynamically using DummyJSON categories and product similarity.</p>
            </div>
          </div>

          {relatedLoading ? (
            <div className="related-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="skeleton related-skeleton" key={index} />
              ))}
            </div>
          ) : (
            <div className="related-grid">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id || item.productId} product={item} compact />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default ProductDetailsPage;