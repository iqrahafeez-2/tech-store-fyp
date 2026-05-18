import './CategoryBar.css';
import { Link } from 'react-router-dom';
import { categories } from '../data/products';

function CategoryBar() {
  return (
    <section className="section category-section">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow">Featured categories</span>
            <h2>Shop by product type</h2>
          </div>
          <Link to="/categories" className="btn btn-light">
            View All
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              to={`/products?category=${category.id}`}
              className="category-card card"
              key={category.id}
            >
              <span>{category.icon}</span>
              <h3>{category.name}</h3>
              <p>{category.subtitle}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryBar;
