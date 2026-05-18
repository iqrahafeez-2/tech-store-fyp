import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import './ProductCard.css';

function formatPrice(product) {
  if (product.price === null || product.price === undefined || Number.isNaN(Number(product.price))) {
    return 'Check price';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'USD',
    }).format(product.price);
  } catch {
    return `${product.currency || '$'} ${product.price}`;
  }
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

function ProductCard({ product, compact = false }) {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    addToCompare,
    isInCompare,
  } = useStore();

  if (!product) {
    return null;
  }

  const id = product.id || product.productId || `dummyjson_${product.externalId}`;
  const stock = getAlwaysInStockValue(product);
  const image = product.image || product.thumbnail || product.images?.[0] || '';
  const rating = Number(product.rating || 4.5);
  const discount = Number(product.discountPercentage || 0);
  const saved = isInWishlist(id);
  const compared = isInCompare(id);

  const safeProduct = {
    ...product,
    id,
    productId: id,
    stock,
    availability: 'In stock',
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart(safeProduct, 1);
  };

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(safeProduct);
  };

  const handleCompare = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addToCompare(safeProduct);
  };

  return (
    <article className={compact ? 'product-card compact' : 'product-card'}>
      <Link
        to={`/products/${encodeURIComponent(id)}`}
        className="product-card-link"
        aria-label={`View details for ${product.title}`}
      >
        <div className="product-image-wrap">
          {image ? (
            <img
              src={image}
              alt={product.title || 'Tech product'}
              className="product-image"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src =
                  'https://dummyjson.com/image/400x300/0f172a/ffffff?text=Tech+Store';
              }}
            />
          ) : (
            <div className="no-image">No Image</div>
          )}

          <div className="product-card-badges">
            <span className="product-source">DummyJSON</span>
            {discount > 0 && <span className="product-discount">-{Math.round(discount)}%</span>}
          </div>

          <button
            type="button"
            className={saved ? 'wishlist-floating active' : 'wishlist-floating'}
            onClick={handleWishlist}
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {saved ? '♥' : '♡'}
          </button>
        </div>

        <div className="product-card-body">
          <div className="product-meta-row">
            <span className="product-category">{product.category || 'Technology'}</span>
            <span className="stock-pill in-stock">In stock</span>
          </div>

          <h3 className="product-title">{product.title || 'Tech Product'}</h3>

          <p className="product-description">
            {product.description || 'Live product result from DummyJSON product provider.'}
          </p>

          <div className="product-rating-row">
            <span className="stars" aria-label={`Rating ${rating.toFixed(1)} out of 5`}>
              {'★'.repeat(Math.max(1, Math.round(rating))).slice(0, 5)}
              <span>{'☆'.repeat(Math.max(0, 5 - Math.round(rating))).slice(0, 5)}</span>
            </span>

            <strong>{rating.toFixed(1)}</strong>
            <small>({product.reviewCount || product.reviews?.length || 24})</small>
          </div>

          <div className="product-spec-chips">
            <span>{product.brand || 'Tech Brand'}</span>
            <span>{product.rawCategory || product.category || 'Device'}</span>
          </div>

          <div className="product-price-row">
            <div>
              <strong className="product-price">{formatPrice(safeProduct)}</strong>

              {discount > 0 && (
                <span className="product-old-price">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: safeProduct.currency || 'USD',
                  }).format(Number(safeProduct.price || 0) / (1 - discount / 100))}
                </span>
              )}
            </div>

            <button type="button" className="product-cart-button" onClick={handleAddToCart}>
              Add
            </button>
          </div>

          <div className="product-card-extra-actions">
            <button
              type="button"
              className={compared ? 'compare-button active' : 'compare-button'}
              onClick={handleCompare}
            >
              {compared ? '✓ Compared' : 'Compare'}
            </button>

            <Link
              to={`/products/${encodeURIComponent(id)}`}
              className="details-button"
              onClick={(event) => event.stopPropagation()}
            >
              Details
            </Link>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;