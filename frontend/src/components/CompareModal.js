import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import './CompareModal.css';

function formatPrice(product) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'USD',
    }).format(Number(product.price || 0));
  } catch {
    return `$${Number(product.price || 0).toLocaleString('en-US')}`;
  }
}

function getSpec(product, key) {
  const specs = product.specifications || {};

  if (key === 'Price') return formatPrice(product);
  if (key === 'Brand') return product.brand || specs.Brand || 'Tech Brand';
  if (key === 'Category') return product.category || specs.Category || 'Technology';
  if (key === 'Rating') return `${Number(product.rating || 4.5).toFixed(1)} / 5`;
  if (key === 'Reviews') return product.reviewCount || product.reviews?.length || 24;
  if (key === 'Stock') return 'In stock';
  if (key === 'Discount') return product.discountPercentage ? `${Math.round(product.discountPercentage)}%` : 'No active discount';
  if (key === 'Warranty') return specs.Warranty || specs.warranty || 'Standard warranty';
  if (key === 'Shipping') return specs.Shipping || specs.shipping || 'Fast delivery available';

  return specs[key] || 'Available';
}

function scoreProduct(product) {
  const ratingScore = Math.min(100, (Number(product.rating || 4.5) / 5) * 35);
  const reviewScore = Math.min(25, Math.log1p(Number(product.reviewCount || 24)) * 5);
  const stockScore = 20;
  const discountScore = Math.min(20, Number(product.discountPercentage || 0));

  return Math.round(ratingScore + reviewScore + stockScore + discountScore);
}

function CompareModal() {
  const {
    compare,
    compareOpen,
    compareCount,
    openCompare,
    closeCompare,
    clearCompare,
    removeFromCompare,
    addToCart,
    showToast,
  } = useStore();

  const rows = [
    'Price',
    'Brand',
    'Category',
    'Rating',
    'Reviews',
    'Stock',
    'Discount',
    'Warranty',
    'Shipping',
  ];

  if (!compareOpen) {
    if (compareCount <= 0) return null;

    return (
      <button type="button" className="compare-floating-tray" onClick={openCompare}>
        <span>⇄</span>
        Compare {compareCount}
      </button>
    );
  }

  return (
    <div className="compare-backdrop" role="presentation" onMouseDown={closeCompare}>
      <section
        className="compare-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Product comparison"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="compare-header">
          <div>
            <span>AI Product Comparison</span>
            <h2>Compare selected products</h2>
            <p>
              Compare price, rating, category, stock, discount and AI value score before buying.
            </p>
          </div>

          <div className="compare-header-actions">
            <button type="button" onClick={clearCompare}>
              Clear
            </button>
            <button type="button" onClick={closeCompare} aria-label="Close compare">
              ×
            </button>
          </div>
        </header>

        {compare.length === 0 ? (
          <div className="compare-empty">
            <span>⇄</span>
            <h3>No products selected</h3>
            <p>Click Compare on any product card to add it here.</p>
            <button type="button" onClick={closeCompare}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="compare-product-row">
              {compare.map((product) => (
                <article key={product.id || product.productId} className="compare-product-card">
                  <button
                    type="button"
                    className="compare-remove"
                    onClick={() => removeFromCompare(product.id || product.productId)}
                    aria-label="Remove product from compare"
                  >
                    ×
                  </button>

                  <img
                    src={product.image || product.thumbnail || product.images?.[0]}
                    alt={product.title}
                    onError={(event) => {
                      event.currentTarget.src =
                        'https://dummyjson.com/image/300x200/0f172a/ffffff?text=Tech+Store';
                    }}
                  />

                  <h3>{product.title}</h3>
                  <p>{product.brand || 'Tech Brand'} · {product.category || 'Technology'}</p>

                  <div className="compare-ai-score">
                    <span>AI Value Score</span>
                    <strong>{scoreProduct(product)}%</strong>
                    <i>
                      <b style={{ width: `${scoreProduct(product)}%` }} />
                    </i>
                  </div>

                  <div className="compare-product-actions">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(product, 1);
                        showToast(`${product.title} added from compare`, 'success');
                      }}
                    >
                      Add to Cart
                    </button>

                    <Link to={`/products/${encodeURIComponent(product.id || product.productId)}`} onClick={closeCompare}>
                      Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    {compare.map((product) => (
                      <th key={product.id || product.productId}>{product.title}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr key={row}>
                      <td>{row}</td>
                      {compare.map((product) => (
                        <td key={`${product.id || product.productId}-${row}`}>
                          {getSpec(product, row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default CompareModal;