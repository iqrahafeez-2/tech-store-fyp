import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { productApi } from '../services/api';

const icons = {
  Mobiles: '📱',
  Laptops: '💻',
  'Computer Hardware': '🧩',
  Gaming: '🎮',
  Accessories: '🔌',
  'Smart Devices': '⌚',
  Technology: '⚡',
};

function CategoriesPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    productApi.getCategories().then((data) => setCategories(data.categories || [])).catch(() => setCategories([]));
  }, []);

  return (
    <section className="container section">
      <div className="section-header">
        <div>
          <span className="eyebrow">Dynamic categories</span>
          <h1 className="title">Browse technology categories</h1>
          <p className="subtitle">Each category opens the API based product listing page with live search, filters, sorting, and AI suggestions.</p>
        </div>
      </div>
      <div className="grid grid-3">
        {categories.map((category) => (
          <Link className="card" style={{ padding: 24 }} to={`/products?category=${encodeURIComponent(category.name)}&search=${encodeURIComponent(category.name)}`} key={category.name}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>{icons[category.name] || '⚡'}</div>
            <h2 style={{ margin: '0 0 8px' }}>{category.name}</h2>
            <p className="subtitle">{category.count || 0} cached products · live API refresh available</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoriesPage;
