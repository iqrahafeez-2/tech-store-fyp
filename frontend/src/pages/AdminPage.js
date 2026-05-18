function AdminPage() {
  const stats = [
    ['Revenue Today', 'Rs 2.4M'],
    ['Orders Today', '142'],
    ['New Users', '38'],
    ['Low Stock', '7'],
  ];

  return (
    <section className="section">
      <div className="container dashboard-layout">
        <aside className="dashboard-sidebar card admin">
          <h3>Admin Panel</h3>
          {['Dashboard', 'Products', 'Orders', 'Users', 'Analytics', 'AI Analytics', 'Inventory', 'Settings'].map((item) => (
            <button key={item} type="button">{item}</button>
          ))}
        </aside>

        <div className="dashboard-content">
          <div className="section-header">
            <div>
              <span className="eyebrow">Admin dashboard</span>
              <h2>Business overview</h2>
              <p className="muted">Analytics cards, charts, order table, stock alerts, and AI insights.</p>
            </div>
          </div>

          <div className="grid grid-4">
            {stats.map(([label, value]) => (
              <div className="stat-card" key={label}><small>{label}</small><strong>{value}</strong></div>
            ))}
          </div>

          <div className="grid grid-2" style={{ marginTop: 20 }}>
            <div className="chart-card card">Revenue Chart · Last 30 days</div>
            <div className="chart-card card">Category Share · Pie Chart</div>
          </div>

          <div className="card" style={{ padding: 22, marginTop: 20 }}>
            <h3>Recent Orders</h3>
            <div className="table-like">
              <div><strong>#TS-0042</strong><span>Muhammad Ali</span><span className="pill">In Transit</span><b>Rs 189,999</b></div>
              <div><strong>#TS-0041</strong><span>Fatima Khan</span><span className="pill success">Delivered</span><b>Rs 89,000</b></div>
              <div><strong>#TS-0040</strong><span>Ahmed Raza</span><span className="pill">Processing</span><b>Rs 249,999</b></div>
            </div>
          </div>

          <div className="card ai-panel" style={{ padding: 22, marginTop: 20 }}>
            <h3>AI Analytics</h3>
            <p className="muted">Trending products are detected using product views, wishlist count, cart additions, purchases, and review sentiment.</p>
            <div className="grid grid-3" style={{ marginTop: 16 }}>
              <div className="stat-card"><small>Positive Sentiment</small><strong>84%</strong></div>
              <div className="stat-card"><small>Top Category</small><strong>Laptops</strong></div>
              <div className="stat-card"><small>Trending Score</small><strong>9.1</strong></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminPage;
