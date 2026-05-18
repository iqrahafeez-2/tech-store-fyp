import { useState } from 'react';
import './ProductModal.css';
import { useStore } from '../context/StoreContext';

function formatPrice(product) {
  if (product.price === null || product.price === undefined) return 'Check latest price';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'USD' }).format(product.price);
  } catch {
    return `${product.currency || '$'} ${product.price}`;
  }
}

function ProductModal({ product, onClose }) {
  const { addToCart, toggleWishlist } = useStore();
  const images = product.images?.length ? product.images : [product.image].filter(Boolean);
  const [activeImage, setActiveImage] = useState(images[0] || '');
  const specs = Object.entries(product.specifications || {}).filter(([, value]) => value !== null && value !== undefined && value !== '');

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Product details">
      <div className="product-modal card">
        <button className="modal-close" onClick={onClose} aria-label="Close product details">×</button>
        <div className="modal-grid">
          <div>
            <div className="modal-image">
              {activeImage ? <img src={activeImage} alt={product.title} /> : <div>No image available</div>}
            </div>
            {images.length > 1 && (
              <div className="thumb-row">
                {images.slice(0, 6).map((image) => (
                  <button key={image} className={image === activeImage ? 'active' : ''} onClick={() => setActiveImage(image)}>
                    <img src={image} alt="Product thumbnail" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="modal-info">
            <span className="badge">{product.source} · {product.category}</span>
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <div className="modal-price">{formatPrice(product)}</div>
            <div className="modal-stats">
              <span>★ {product.rating ? Number(product.rating).toFixed(1) : 'N/A'}</span>
              <span>{product.reviewCount || 0} reviews</span>
              <span>{product.availability || 'Check seller'}</span>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => addToCart(product)}>Add to Cart</button>
              <button className="btn btn-secondary" onClick={() => toggleWishlist(product)}>Wishlist</button>
              {product.productUrl && <a className="btn btn-secondary" href={product.productUrl} target="_blank" rel="noreferrer">View Source</a>}
            </div>
            <h3>Specifications</h3>
            <div className="spec-table">
              {specs.length === 0 && <div className="spec-row"><strong>Info</strong><span>Specifications are not available from this provider.</span></div>}
              {specs.slice(0, 14).map(([key, value]) => (
                <div className="spec-row" key={key}>
                  <strong>{key}</strong>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
