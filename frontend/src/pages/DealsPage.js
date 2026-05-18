import ProductList from '../components/ProductList';

function DealsPage() {
  return (
    <>
      <section className="container section-tight">
        <div className="card" style={{ padding: 30, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white' }}>
          <span className="eyebrow" style={{ background: 'rgba(255,255,255,.18)', color: 'white' }}>Offers and deals</span>
          <h1 style={{ marginTop: 12 }}>Flash sale ends soon</h1>
          <p style={{ marginTop: 12, lineHeight: 1.7, color: '#fff7ed' }}>
            Clear discount badges, original price, and final price are shown to prevent confusion during purchase decisions.
          </p>
          <div className="trust-row" style={{ marginTop: 16 }}>
            <span>⏱ 02:14:38 remaining</span>
            <span>🏷 Up to 30% off</span>
            <span>🚚 Free delivery selected items</span>
          </div>
        </div>
      </section>
      <ProductList title="Discounted Products" subtitle="Limited time technology deals with transparent pricing." />
    </>
  );
}

export default DealsPage;
