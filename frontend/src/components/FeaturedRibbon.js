import './FeaturedRibbon.css';
import { Link } from 'react-router-dom';

function FeaturedRibbon() {
  return (
    <section className="container featured-ribbon">
      <div>
        <span className="eyebrow">Smart recommendation</span>
        <h2>Let AI shortlist products based on your needs.</h2>
        <p>
          Tell Tech Store your budget, brand preference, and usage. The recommendation engine
          ranks products using price, category, rating, behavior, and similarity score.
        </p>
      </div>
      <Link to="/ai-recommendations" className="btn btn-primary">
        Open AI Picks
      </Link>
    </section>
  );
}

export default FeaturedRibbon;
