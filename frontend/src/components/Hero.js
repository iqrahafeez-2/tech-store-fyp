import './Hero.css';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="hero section-tight">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">AI powered technology shopping</span>
          <h1>Find the right tech product faster.</h1>
          <p>
            Shop laptops, mobiles, gaming products, accessories, smart devices, and computer
            hardware with smart recommendations, quick comparison, and secure checkout.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/products">
              Shop Now
            </Link>
            <Link className="btn btn-light" to="/ai-recommendations">
              Get AI Recommendations
            </Link>
          </div>
          <div className="trust-row" aria-label="Trust badges">
            <span>🔒 Secure payment</span>
            <span>🚚 Fast delivery</span>
            <span>🤖 AI assistant</span>
            <span>↩ Easy returns</span>
          </div>
        </div>

        <div className="hero-panel card" aria-label="Featured hero product area">
          <div className="hero-glow"></div>
          <div className="hero-product-main">💻</div>
          <div className="hero-floating-card top">
            <strong>AI Match Score</strong>
            <span>9.2 out of 10</span>
          </div>
          <div className="hero-floating-card bottom">
            <strong>Flash Deal</strong>
            <span>Save up to 30%</span>
          </div>
          <div className="hero-dots" aria-label="carousel dots">
            <span className="active"></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
