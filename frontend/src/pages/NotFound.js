import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div className="empty-state">
          <h1>404</h1>
          <h3>Page not found</h3>
          <p className="muted">The page you are looking for does not exist.</p>
          <Link className="btn btn-primary" style={{ marginTop: 16 }} to="/">Go Home</Link>
        </div>
      </div>
    </section>
  );
}

export default NotFound;
