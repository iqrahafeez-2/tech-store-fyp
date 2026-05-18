import './Footer.css';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand footer-brand-line">
            <span className="brand-mark">TS</span>
            <span>
              <strong>Tech Store</strong>
              <small>AI powered e-commerce</small>
            </span>
          </div>
          <p>
            Modern technology shopping platform with AI recommendations, chatbot support,
            smart search, secure checkout, and order tracking.
          </p>
        </div>

        <div>
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/deals">Offers and Deals</Link>
          <Link to="/ai-recommendations">AI Recommendations</Link>
        </div>

        <div>
          <h4>Support</h4>
          <Link to="/track-order">Track Order</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/reviews">Reviews</Link>
        </div>

        <div>
          <h4>Newsletter</h4>
          <p>Get new deals and AI curated product picks.</p>
          <form className="newsletter-form">
            <input aria-label="Email for newsletter" placeholder="Enter your email" />
            <button type="button">Join</button>
          </form>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Tech Store. Final Year Project.</span>
        <span>Privacy Policy · Terms · Security</span>
      </div>
    </footer>
  );
}

export default Footer;
