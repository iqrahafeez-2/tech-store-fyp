function StaticPage({ type }) {
  const content = {
    about: {
      title: 'About Tech Store',
      eyebrow: 'About us',
      text: 'Tech Store is a modern AI powered e-commerce FYP focused on technology products, usability, scalability, and intelligent decision support.',
    },
    contact: {
      title: 'Contact Us',
      eyebrow: 'Support',
      text: 'Reach our support team for product guidance, order help, returns, and technical assistance.',
    },
    faq: {
      title: 'Frequently Asked Questions',
      eyebrow: 'Help center',
      text: 'Find answers about accounts, delivery, payments, returns, warranties, and product recommendations.',
    },
    reviews: {
      title: 'Reviews and Ratings',
      eyebrow: 'Customer trust',
      text: 'AI sentiment analysis summarizes customer reviews into positive, neutral, and negative insights.',
    },
  }[type];

  return (
    <section className="section">
      <div className="container">
        <div className="card" style={{ padding: 30 }}>
          <span className="eyebrow">{content.eyebrow}</span>
          <h1 style={{ marginTop: 12 }}>{content.title}</h1>
          <p className="muted" style={{ marginTop: 14, lineHeight: 1.8, maxWidth: 760 }}>{content.text}</p>
        </div>

        {type === 'contact' && (
          <div className="grid grid-2" style={{ marginTop: 20 }}>
            <form className="card" style={{ padding: 22, display: 'grid', gap: 12 }}>
              <input className="input" placeholder="Full name" />
              <input className="input" placeholder="Email address" />
              <textarea placeholder="Your message" />
              <button className="btn btn-primary" type="button">Send Message</button>
            </form>
            <div className="card" style={{ padding: 22 }}>
              <h3>Contact Details</h3>
              <p className="muted" style={{ marginTop: 10, lineHeight: 1.8 }}>Email: support@techstore.com<br />Phone: 03XX XXXXXXX<br />Address: Bahria University Islamabad Campus</p>
            </div>
          </div>
        )}

        {type === 'faq' && (
          <div className="card" style={{ padding: 22, marginTop: 20 }}>
            {['How does AI recommendation work?', 'Can I track my order?', 'Which payment methods are available?', 'How can I return a product?'].map((question) => (
              <details key={question} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 900 }}>{question}</summary>
                <p className="muted" style={{ marginTop: 10, lineHeight: 1.7 }}>This section uses clear disclosure controls to reduce page clutter and support recognition based interaction.</p>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default StaticPage;
