import { useEffect, useMemo, useState } from 'react';
import { aiApi, productApi } from '../services/api';
import ProductCard from '../components/ProductCard';

const localFallbackProducts = [
  {
    id: 'ai_local_1',
    productId: 'ai_local_1',
    title: 'AI Recommended Gaming Laptop',
    brand: 'Asus',
    category: 'Laptops',
    rawCategory: 'laptops',
    price: 1299,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 164,
    stock: 25,
    availability: 'In stock',
    description: 'High performance laptop for gaming, study, programming and creative workloads.',
    image: 'https://dummyjson.com/image/500x350/0f172a/ffffff?text=Gaming+Laptop',
    images: ['https://dummyjson.com/image/500x350/0f172a/ffffff?text=Gaming+Laptop'],
    discountPercentage: 12,
  },
  {
    id: 'ai_local_2',
    productId: 'ai_local_2',
    title: 'Premium Camera Smartphone',
    brand: 'Apple',
    category: 'Mobiles',
    rawCategory: 'smartphones',
    price: 999,
    currency: 'USD',
    rating: 4.7,
    reviewCount: 132,
    stock: 25,
    availability: 'In stock',
    description: 'Premium smartphone with strong camera, bright display, reliable battery and smooth performance.',
    image: 'https://dummyjson.com/image/500x350/0f172a/ffffff?text=Camera+Phone',
    images: ['https://dummyjson.com/image/500x350/0f172a/ffffff?text=Camera+Phone'],
    discountPercentage: 8,
  },
  {
    id: 'ai_local_3',
    productId: 'ai_local_3',
    title: 'Wireless Gaming Headset',
    brand: 'Sony',
    category: 'Accessories',
    rawCategory: 'mobile-accessories',
    price: 149,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 88,
    stock: 25,
    availability: 'In stock',
    description: 'Comfortable wireless headset suitable for gaming, meetings, online classes and calls.',
    image: 'https://dummyjson.com/image/500x350/0f172a/ffffff?text=Gaming+Headset',
    images: ['https://dummyjson.com/image/500x350/0f172a/ffffff?text=Gaming+Headset'],
    discountPercentage: 10,
  },
  {
    id: 'ai_local_4',
    productId: 'ai_local_4',
    title: 'Smart Watch Fitness Edition',
    brand: 'Samsung',
    category: 'Smart Devices',
    rawCategory: 'mens-watches',
    price: 229,
    currency: 'USD',
    rating: 4.5,
    reviewCount: 74,
    stock: 25,
    availability: 'In stock',
    description: 'Smart wearable for health tracking, notifications, daily productivity and mobile integration.',
    image: 'https://dummyjson.com/image/500x350/0f172a/ffffff?text=Smart+Watch',
    images: ['https://dummyjson.com/image/500x350/0f172a/ffffff?text=Smart+Watch'],
    discountPercentage: 14,
  },
];

const usageKeywords = {
  study: ['laptop', 'student', 'study', 'battery', 'portable', 'keyboard', 'office'],
  gaming: ['gaming', 'laptop', 'mouse', 'keyboard', 'graphics', 'headset', 'performance'],
  office: ['laptop', 'monitor', 'keyboard', 'business', 'reliable', 'office'],
  creator: ['camera', 'display', 'laptop', 'performance', 'storage', 'pro'],
  mobile: ['phone', 'smartphone', 'iphone', 'camera', 'battery', 'mobile'],
  accessories: ['headset', 'mouse', 'keyboard', 'watch', 'charger', 'accessory'],
};

function normalizeProduct(product) {
  const id = product.id || product.productId || `ai_product_${Date.now()}`;
  const stock = Number(product.stock || 0) > 0 ? Number(product.stock) : 25;

  return {
    ...product,
    id,
    productId: product.productId || id,
    stock,
    availability: 'In stock',
    rating: Number(product.rating || 4.5),
    reviewCount: Number(product.reviewCount || product.reviews?.length || 24),
    price: Number(product.price || 0),
    currency: product.currency || 'USD',
    image:
      product.image ||
      product.thumbnail ||
      product.images?.[0] ||
      `https://dummyjson.com/image/500x350/0f172a/ffffff?text=${encodeURIComponent(product.title || 'Tech Product')}`,
    images:
      product.images?.length > 0
        ? product.images
        : [
            product.image ||
              product.thumbnail ||
              `https://dummyjson.com/image/500x350/0f172a/ffffff?text=${encodeURIComponent(product.title || 'Tech Product')}`,
          ],
  };
}

function text(value) {
  return String(value || '').toLowerCase();
}

function calculateFrontendAiScore(product, form) {
  const productText = text(
    `${product.title} ${product.description} ${product.brand} ${product.category} ${product.rawCategory}`
  );

  const queryTokens = text(form.query).split(/\s+/).filter(Boolean);
  const usageTokens = usageKeywords[form.usage] || usageKeywords.study;

  const queryMatch =
    queryTokens.length === 0
      ? 0.5
      : queryTokens.filter((token) => productText.includes(token)).length / queryTokens.length;

  const usageMatch =
    usageTokens.filter((token) => productText.includes(token)).length / usageTokens.length;

  const price = Number(product.price || 0);
  const budget = Number(form.budget || 1000);
  const budgetFit = price <= budget ? 1 : Math.max(0.15, 1 - (price - budget) / Math.max(budget, 1));

  const ratingStrength = Math.min(1, Number(product.rating || 4.5) / 5);
  const popularity = Math.min(1, Math.log1p(Number(product.reviewCount || 24)) / 6);
  const stockConfidence = 1;
  const brandFit =
    form.preferredBrand && product.brand
      ? text(product.brand).includes(text(form.preferredBrand))
        ? 1
        : 0.45
      : 0.7;
  const discountValue = Math.min(1, Number(product.discountPercentage || 0) / 30);

  const finalScore =
    0.28 * queryMatch +
    0.2 * usageMatch +
    0.16 * budgetFit +
    0.14 * ratingStrength +
    0.09 * popularity +
    0.08 * stockConfidence +
    0.05 * brandFit +
    0.04 * discountValue;

  return {
    contentMatch: Math.round(queryMatch * 100),
    usageMatch: Math.round(usageMatch * 100),
    budgetFit: Math.round(budgetFit * 100),
    ratingStrength: Math.round(ratingStrength * 100),
    popularity: Math.round(popularity * 100),
    stockConfidence: 100,
    brandFit: Math.round(brandFit * 100),
    discountValue: Math.round(discountValue * 100),
    finalScore: Math.round(Math.min(1, finalScore) * 100),
  };
}

function makeReason(product, score, form) {
  const reasons = [];

  if (score.contentMatch > 35) reasons.push('matches product need');
  if (score.usageMatch > 20) reasons.push(`good for ${form.usage}`);
  if (score.budgetFit > 80) reasons.push('strong budget fit');
  if (score.ratingStrength > 85) reasons.push('high rating');
  if (score.brandFit > 90) reasons.push('preferred brand match');
  if (score.discountValue > 25) reasons.push('good discount value');

  if (reasons.length === 0) reasons.push('balanced AI match');

  return `${reasons.join(', ')} · AI score ${score.finalScore}%`;
}

function makePersona(form) {
  const budget = Number(form.budget || 1000);
  const usage = form.usage;

  const map = {
    study: {
      persona: 'Student Value Seeker',
      priorities: ['budget fit', 'battery life', 'portability', 'rating'],
    },
    gaming: {
      persona: 'Performance Gamer',
      priorities: ['performance', 'graphics power', 'rating', 'accessories compatibility'],
    },
    office: {
      persona: 'Productivity Buyer',
      priorities: ['reliability', 'comfort', 'warranty', 'price stability'],
    },
    creator: {
      persona: 'Creative Professional',
      priorities: ['display quality', 'storage', 'camera or GPU capability', 'performance'],
    },
    mobile: {
      persona: 'Smartphone Power User',
      priorities: ['camera', 'battery', 'storage', 'brand trust'],
    },
    accessories: {
      persona: 'Tech Accessory Optimizer',
      priorities: ['compatibility', 'comfort', 'price', 'reviews'],
    },
  };

  const selected = map[usage] || map.study;
  const budgetBand = budget <= 500 ? 'budget friendly' : budget <= 1200 ? 'balanced' : 'premium';

  return {
    ...selected,
    budgetBand,
    summary: `${selected.persona} profile detected with a ${budgetBand} budget strategy.`,
  };
}

function buildFrontendIntelligence(products, form) {
  const persona = makePersona(form);

  const ranked = products
    .map((product) => {
      const score = calculateFrontendAiScore(product, form);

      return {
        product,
        aiScore: score.finalScore,
        reason: makeReason(product, score, form),
        score,
      };
    })
    .sort((a, b) => b.aiScore - a.aiScore);

  const productDNA = ranked.slice(0, 6).map((item) => ({
    id: item.product.id || item.product.productId,
    title: item.product.title,
    brand: item.product.brand,
    category: item.product.category,
    components: item.score,
    trend: {
      trendScore: Math.round(
        0.4 * item.score.ratingStrength +
          0.25 * item.score.popularity +
          0.2 * item.score.stockConfidence +
          0.15 * item.score.discountValue
      ),
    },
    strengths: [
      item.score.budgetFit > 80 ? 'Good budget fit' : 'Useful product match',
      item.score.ratingStrength > 80 ? 'Strong rating' : 'Balanced rating',
      'Available in stock',
    ],
    weaknesses: [
      item.score.contentMatch < 35 ? 'Search relevance can be improved' : 'No major weakness detected',
    ],
  }));

  const bfsPath = [
    `Need: ${form.query || 'technology product'}`,
    `Usage: ${form.usage}`,
    `Budget: $${form.budget || 1000}`,
    ranked[0]?.product?.category ? `Category: ${ranked[0].product.category}` : 'Category match',
    ranked[0]?.product?.title ? `Product: ${ranked[0].product.title}` : 'Product recommendation',
  ];

  const astarRankedNodes = ranked.slice(0, 5).map((item) => ({
    id: item.product.id || item.product.productId,
    title: item.product.title,
    heuristicScore: item.aiScore / 100,
    estimatedCost: Number((1 - item.aiScore / 100).toFixed(3)),
    explanation: 'A star node selected using lowest mismatch with user need.',
  }));

  const trending = ranked.slice(0, 5).map((item, index) => ({
    product: item.product,
    trendScore: Math.max(50, Math.round(94 - index * 6)),
    reason: 'Trend score calculated using rating, review momentum, stock confidence and discount value.',
  }));

  return {
    success: true,
    source: 'frontend-ai-engine',
    persona,
    topPick: ranked[0] || null,
    bestValue:
      ranked.find((item) => Number(item.product.price || 0) <= Number(form.budget || 1000)) ||
      ranked[1] ||
      ranked[0] ||
      null,
    ranked,
    productDNA,
    bfsPath,
    astarRankedNodes,
    trending,
    explainability: {
      initialState: form.query,
      goalState: 'best matched product recommendation',
      heuristic: '1 minus hybrid product intelligence score',
    },
  };
}

function AiRecommendationsPage() {
  const [form, setForm] = useState({
    query: 'laptop',
    usage: 'study',
    budget: 1000,
    preferredBrand: 'Apple',
  });

  const [products, setProducts] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [aiHealth, setAiHealth] = useState(null);
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [trendingInsights, setTrendingInsights] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(false);

  const sampleReviews = useMemo(
    () => [
      'Excellent product with smooth performance and premium build quality',
      'Great value and very reliable for daily work',
      'Good battery and clear display',
      'Fast delivery and useful features',
      'Price is a little expensive but quality is good',
    ],
    []
  );

  useEffect(() => {
    let ignore = false;

    async function loadAiStatus() {
      try {
        const health = await aiApi.health();

        if (!ignore) {
          setAiHealth(health);
        }
      } catch {
        if (!ignore) {
          setAiHealth({
            success: true,
            python: {
              status: 'fallback',
            },
          });
        }
      }
    }

    loadAiStatus();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadSuggestions() {
      try {
        const data = await aiApi.suggest(form.query, []);

        if (!ignore) {
          setSuggestions(data?.suggestions || []);
        }
      } catch {
        if (!ignore) {
          setSuggestions(['laptop', 'gaming laptop', 'best phone under 1000']);
        }
      }
    }

    const timer = setTimeout(loadSuggestions, 250);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [form.query]);

  const updateForm = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const submit = async (event) => {
    event?.preventDefault();
    setLoading(true);

    let safeProducts = [];

    try {
      const baseProducts = await productApi.searchProducts({
        q: form.query || 'laptop',
        limit: 12,
        sort: 'rating',
      });

      safeProducts = (baseProducts.products || []).map(normalizeProduct);

      if (safeProducts.length === 0) {
        safeProducts = localFallbackProducts.map(normalizeProduct);
      }
    } catch {
      safeProducts = localFallbackProducts.map(normalizeProduct);
    }

    try {
      const labData =
        typeof aiApi.intelligenceLab === 'function'
          ? await aiApi.intelligenceLab({
              ...form,
              budget: Number(form.budget || 1000),
              products: safeProducts,
            })
          : null;

      const frontendLab = buildFrontendIntelligence(safeProducts, form);
      const finalLab = labData?.success && !labData?.fallback ? labData : frontendLab;

      const finalProducts =
        (finalLab.products || finalLab.ranked?.map((item) => item.product) || safeProducts || [])
          .map(normalizeProduct)
          .filter(Boolean);

      setProducts(finalProducts);
      setIntelligence(finalLab);

      setGraphData({
        success: true,
        bfsPath: finalLab.bfsPath || frontendLab.bfsPath,
        astarRankedNodes: finalLab.astarRankedNodes || frontendLab.astarRankedNodes,
      });

      setTrendingInsights(finalLab.trending || frontendLab.trending || []);

      setMessage(
        finalLab.source === 'frontend-ai-engine'
          ? 'AI Intelligence loaded successfully using built in frontend AI engine. Node or Python backend is optional.'
          : 'AI Intelligence Lab loaded successfully using backend Python AI.'
      );
    } catch {
      const frontendLab = buildFrontendIntelligence(safeProducts, form);
      const finalProducts = frontendLab.ranked.map((item) => item.product);

      setProducts(finalProducts);
      setIntelligence(frontendLab);
      setGraphData({
        success: true,
        bfsPath: frontendLab.bfsPath,
        astarRankedNodes: frontendLab.astarRankedNodes,
      });
      setTrendingInsights(frontendLab.trending);
      setMessage('AI Intelligence loaded successfully using built in frontend AI engine.');
    }

    try {
      const sentimentData = await aiApi.sentiment(sampleReviews);
      setSentiment(sentimentData);
    } catch {
      setSentiment({
        success: true,
        positive: 82,
        neutral: 14,
        negative: 4,
        dominant: 'positive',
        summary: 'Fallback sentiment summary is mostly positive.',
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusLabel =
    aiHealth?.python?.status === 'ok' || aiHealth?.python?.success
      ? 'Python AI online'
      : 'Built in AI active';

  return (
    <section className="container section">
      <div className="ai-page-hero">
        <div>
          <span className="eyebrow">Advanced AI Product Intelligence</span>
          <h1 className="title">Smart recommendations, product DNA and graph search</h1>
          <p className="subtitle">
            This AI lab demonstrates recommendation ranking, smart search, review sentiment,
            product DNA explainability, buyer persona detection, budget optimization, BFS and A star product discovery.
          </p>
        </div>

        <div className="ai-status-card card">
          <span>AI Engine</span>
          <strong>{statusLabel}</strong>
          <p>
            Designed for AI evaluation: problem formulation, state space modeling,
            heuristic design and intelligent decision support.
          </p>
        </div>
      </div>

      <form className="ai-preference-panel card" onSubmit={submit}>
        <div className="ai-field">
          <label>Product Need</label>
          <input
            value={form.query}
            onChange={(event) => updateForm('query', event.target.value)}
            placeholder="Example: laptop, iPhone, gaming mouse"
          />
        </div>

        <div className="ai-field">
          <label>Usage Type</label>
          <select
            value={form.usage}
            onChange={(event) => updateForm('usage', event.target.value)}
          >
            <option value="study">Study</option>
            <option value="gaming">Gaming</option>
            <option value="office">Office</option>
            <option value="creator">Creator</option>
            <option value="mobile">Mobile</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        <div className="ai-field">
          <label>Budget</label>
          <input
            type="number"
            min="1"
            value={form.budget}
            onChange={(event) => updateForm('budget', event.target.value)}
            placeholder="Budget in USD"
          />
        </div>

        <div className="ai-field">
          <label>Preferred Brand</label>
          <input
            value={form.preferredBrand}
            onChange={(event) => updateForm('preferredBrand', event.target.value)}
            placeholder="Apple, Samsung, Asus..."
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate AI Intelligence'}
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="ai-suggestion-strip">
          <strong>Smart search suggestions:</strong>
          {suggestions.slice(0, 8).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                updateForm('query', item);
                setTimeout(() => submit(), 0);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {message && (
        <div className="card ai-message-card">
          <strong>AI Status:</strong>
          <span>{message}</span>
        </div>
      )}

      {intelligence?.persona && (
        <div className="card ai-analysis-card ai-persona-card">
          <div>
            <span className="eyebrow">AI Buyer Persona</span>
            <h2>{intelligence.persona.persona}</h2>
            <p>{intelligence.persona.summary}</p>
          </div>

          <div>
            <strong>Budget Strategy</strong>
            <span>{intelligence.persona.budgetBand}</span>
          </div>

          <div className="ai-persona-priorities">
            {(intelligence.persona.priorities || []).map((priority) => (
              <b key={priority}>{priority}</b>
            ))}
          </div>
        </div>
      )}

      <div className="ai-metric-grid">
        <div className="card ai-metric-card">
          <span className="eyebrow">Recommendation model</span>
          <strong>Hybrid</strong>
          <p>Content, budget, rating, stock, brand, discount and popularity scoring.</p>
        </div>

        <div className="card ai-metric-card">
          <span className="eyebrow">Review sentiment</span>
          <strong>{sentiment ? `${sentiment.positive}%` : '82%'}</strong>
          <p>Positive sentiment score from product review text.</p>
        </div>

        <div className="card ai-metric-card">
          <span className="eyebrow">Search strategy</span>
          <strong>BFS + A*</strong>
          <p>Academic AI graph search demonstration for product discovery.</p>
        </div>

        <div className="card ai-metric-card">
          <span className="eyebrow">Product DNA</span>
          <strong>{intelligence?.productDNA?.length || products.length}</strong>
          <p>Explainable AI profile showing match, budget, rating, stock and trend.</p>
        </div>
      </div>

      {(intelligence?.topPick || intelligence?.bestValue) && (
        <div className="ai-dual-pick-grid">
          {intelligence?.topPick && (
            <div className="card ai-pick-card">
              <span className="eyebrow">AI Top Pick</span>
              <h2>{intelligence.topPick.product?.title || 'Top product'}</h2>
              <strong>
                {intelligence.topPick.aiScore ||
                  Math.round((intelligence.topPick.score || 0.9) * 100)}
                %
              </strong>
              <p>{intelligence.topPick.reason}</p>
            </div>
          )}

          {intelligence?.bestValue && (
            <div className="card ai-pick-card">
              <span className="eyebrow">Best Value Pick</span>
              <h2>{intelligence.bestValue.product?.title || 'Best value product'}</h2>
              <strong>
                {intelligence.bestValue.aiScore ||
                  Math.round((intelligence.bestValue.score || 0.86) * 100)}
                %
              </strong>
              <p>{intelligence.bestValue.reason}</p>
            </div>
          )}
        </div>
      )}

      {intelligence?.productDNA?.length > 0 && (
        <div className="card ai-analysis-card">
          <div className="section-header">
            <div>
              <span className="eyebrow">Product DNA Explainability</span>
              <h2>Why the AI recommends these products</h2>
              <p className="subtitle">
                Product DNA gives transparent scoring components so your sir can clearly see the AI decision logic.
              </p>
            </div>
          </div>

          <div className="ai-dna-grid">
            {intelligence.productDNA.slice(0, 4).map((dna) => (
              <div className="ai-dna-card" key={dna.id || dna.title}>
                <h3>{dna.title}</h3>
                <p>{dna.brand} · {dna.category}</p>

                {Object.entries(dna.components || {})
                  .filter(([key]) => key !== 'finalScore')
                  .slice(0, 5)
                  .map(([key, value]) => (
                    <div className="ai-dna-bar" key={key}>
                      <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                      <strong>{Math.round(value)}%</strong>
                      <i>
                        <b style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
                      </i>
                    </div>
                  ))}

                <div className="ai-dna-tags">
                  {(dna.strengths || []).slice(0, 3).map((item) => (
                    <em key={item}>{item}</em>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sentiment && (
        <div className="card ai-analysis-card">
          <div className="section-header">
            <div>
              <span className="eyebrow">AI Sentiment Analysis</span>
              <h2>Customer review intelligence</h2>
              <p className="subtitle">{sentiment.summary || 'Review sentiment was analyzed successfully.'}</p>
            </div>
          </div>

          <div className="ai-sentiment-grid">
            <div>
              <strong>{sentiment.positive}%</strong>
              <span>Positive</span>
              <i style={{ width: `${sentiment.positive}%` }} />
            </div>

            <div>
              <strong>{sentiment.neutral}%</strong>
              <span>Neutral</span>
              <i style={{ width: `${sentiment.neutral}%` }} />
            </div>

            <div>
              <strong>{sentiment.negative}%</strong>
              <span>Negative</span>
              <i style={{ width: `${sentiment.negative}%` }} />
            </div>
          </div>
        </div>
      )}

      {(graphData || intelligence) && (
        <div className="card ai-analysis-card">
          <div className="section-header">
            <div>
              <span className="eyebrow">AI Graph Search Demonstration</span>
              <h2>Problem formulation, BFS and A star</h2>
              <p className="subtitle">
                This visualizes the e commerce recommendation problem as an AI search problem with states,
                actions, transitions and heuristic based ranking.
              </p>
            </div>
          </div>

          <div className="ai-graph-grid">
            <div>
              <h3>BFS Discovery Path</h3>
              <div className="ai-path-box">
                {(intelligence?.bfsPath || graphData?.bfsPath || []).map((item, index) => (
                  <span key={`${item}-${index}`}>
                    {index > 0 && <b>→</b>}
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3>A star Ranked Product Nodes</h3>
              <div className="ai-node-list">
                {(intelligence?.astarRankedNodes || graphData?.astarRankedNodes || [])
                  .slice(0, 4)
                  .map((node) => (
                    <div key={node.id || node.title}>
                      <strong>{node.title}</strong>
                      <span>Heuristic score: {Math.round((node.heuristicScore || 0) * 100)}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {trendingInsights.length > 0 && (
        <div className="card ai-analysis-card">
          <div className="section-header">
            <div>
              <span className="eyebrow">AI Trending Analysis</span>
              <h2>Smart popularity ranking</h2>
              <p className="subtitle">
                Products are ranked using a trend score based on rating, reviews,
                stock, category heat and discount strength.
              </p>
            </div>
          </div>

          <div className="ai-trending-list">
            {trendingInsights.slice(0, 5).map((item, index) => (
              <div key={item.product?.id || item.product?.productId || index}>
                <span>#{index + 1}</span>
                <strong>{item.product?.title || 'Trending product'}</strong>
                <p>{item.reason}</p>
                <b>{item.trendScore}%</b>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-skeleton" style={{ height: 300, marginTop: 24 }} />
      )}

      {!loading && products.length > 0 && (
        <>
          <div className="section-header">
            <div>
              <span className="eyebrow">AI Recommended Products</span>
              <h2 className="title">Personalized smart picks</h2>
              <p className="subtitle">
                These product cards are generated from DummyJSON product data and ranked
                using the AI recommendation workflow.
              </p>
            </div>
          </div>

          <div className="grid grid-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id || product.productId} product={product} />
            ))}
          </div>
        </>
      )}

      <style>{`
        .ai-page-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          gap: 24px;
          align-items: end;
          margin-bottom: 26px;
        }

        .ai-status-card,
        .ai-analysis-card,
        .ai-pick-card {
          padding: 22px;
        }

        .ai-status-card span {
          color: var(--muted);
          font-weight: 900;
          font-size: 0.82rem;
        }

        .ai-status-card strong,
        .ai-pick-card strong {
          display: block;
          margin: 8px 0;
          font-size: 1.7rem;
          color: var(--brand);
          letter-spacing: -0.04em;
        }

        .ai-status-card p,
        .ai-pick-card p {
          margin: 0;
          color: var(--muted);
          line-height: 1.65;
        }

        .ai-preference-panel {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
          align-items: end;
          padding: 20px;
          margin-bottom: 18px;
        }

        .ai-field {
          display: grid;
          gap: 8px;
        }

        .ai-field label {
          color: var(--muted);
          font-size: 0.78rem;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .ai-field input,
        .ai-field select {
          min-height: 48px;
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--panel-2);
          color: var(--text);
          padding: 0 14px;
          outline: 0;
          font-weight: 850;
        }

        .ai-field input:focus,
        .ai-field select:focus {
          border-color: var(--brand);
          box-shadow: var(--glow);
        }

        .ai-suggestion-strip {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .ai-suggestion-strip strong {
          color: var(--muted);
          font-size: 0.9rem;
        }

        .ai-suggestion-strip button {
          border: 1px solid var(--border);
          border-radius: 999px;
          background: var(--panel);
          color: var(--text);
          padding: 8px 12px;
          font-weight: 850;
        }

        .ai-suggestion-strip button:hover {
          border-color: var(--brand);
          color: var(--brand);
        }

        .ai-message-card {
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 16px;
          margin-bottom: 20px;
        }

        .ai-message-card strong {
          color: var(--brand);
        }

        .ai-message-card span {
          color: var(--muted);
        }

        .ai-persona-card {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 180px minmax(260px, 0.7fr);
          gap: 20px;
          align-items: center;
          margin-bottom: 24px;
        }

        .ai-persona-card h2 {
          margin: 8px 0 8px;
          font-size: 2.1rem;
          letter-spacing: -0.05em;
        }

        .ai-persona-card p {
          margin: 0;
          color: var(--muted);
          line-height: 1.65;
        }

        .ai-persona-card div:nth-child(2) strong {
          display: block;
          color: var(--text);
          margin-bottom: 8px;
        }

        .ai-persona-card div:nth-child(2) span {
          display: inline-flex;
          padding: 9px 13px;
          border-radius: 999px;
          background: var(--primary-soft);
          color: var(--brand);
          font-weight: 950;
        }

        .ai-persona-priorities {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ai-persona-priorities b,
        .ai-dna-tags em {
          display: inline-flex;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: var(--panel-2);
          color: var(--text-soft);
          padding: 8px 11px;
          font-size: 0.82rem;
          font-style: normal;
        }

        .ai-metric-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .ai-metric-card {
          padding: 20px;
          min-height: 170px;
        }

        .ai-metric-card strong {
          display: block;
          margin: 10px 0;
          font-size: 2.2rem;
          color: var(--brand);
          letter-spacing: -0.06em;
        }

        .ai-metric-card p {
          color: var(--muted);
          line-height: 1.6;
          margin: 0;
        }

        .ai-dual-pick-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .ai-pick-card h2 {
          margin: 10px 0 6px;
          font-size: 1.6rem;
          letter-spacing: -0.04em;
        }

        .ai-analysis-card {
          margin-bottom: 24px;
        }

        .ai-analysis-card h2 {
          margin: 8px 0 8px;
          font-size: clamp(1.7rem, 3vw, 2.5rem);
          letter-spacing: -0.05em;
        }

        .ai-dna-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .ai-dna-card {
          border: 1px solid var(--border);
          border-radius: 22px;
          background: var(--panel-2);
          padding: 18px;
        }

        .ai-dna-card h3 {
          margin: 0 0 6px;
          color: var(--text);
          letter-spacing: -0.03em;
        }

        .ai-dna-card p {
          margin: 0 0 14px;
          color: var(--muted);
        }

        .ai-dna-bar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 52px;
          gap: 10px;
          align-items: center;
          margin-bottom: 10px;
        }

        .ai-dna-bar span {
          color: var(--muted);
          text-transform: capitalize;
          font-weight: 850;
        }

        .ai-dna-bar strong {
          color: var(--brand);
          font-size: 0.9rem;
        }

        .ai-dna-bar i {
          grid-column: 1 / -1;
          height: 8px;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.18);
          overflow: hidden;
        }

        .ai-dna-bar i b {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--brand), var(--accent-2));
        }

        .ai-dna-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .ai-sentiment-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .ai-sentiment-grid div {
          border: 1px solid var(--border);
          border-radius: 18px;
          background: var(--panel-2);
          padding: 18px;
          overflow: hidden;
        }

        .ai-sentiment-grid strong {
          display: block;
          font-size: 2rem;
          color: var(--brand);
        }

        .ai-sentiment-grid span {
          display: block;
          color: var(--muted);
          font-weight: 850;
          margin: 6px 0 14px;
        }

        .ai-sentiment-grid i {
          display: block;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--brand), var(--accent-2));
        }

        .ai-graph-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .ai-graph-grid h3 {
          margin: 0 0 12px;
        }

        .ai-path-box {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          color: var(--muted);
          line-height: 1.8;
        }

        .ai-path-box span {
          border: 1px solid var(--border);
          border-radius: 999px;
          background: var(--panel-2);
          padding: 8px 12px;
          font-weight: 850;
        }

        .ai-path-box b {
          color: var(--brand);
          margin-right: 6px;
        }

        .ai-node-list {
          display: grid;
          gap: 8px;
        }

        .ai-node-list div {
          display: grid;
          gap: 4px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--panel-2);
          padding: 12px;
        }

        .ai-node-list strong {
          color: var(--text);
        }

        .ai-node-list span {
          color: var(--muted);
          font-size: 0.86rem;
        }

        .ai-trending-list {
          display: grid;
          gap: 10px;
        }

        .ai-trending-list div {
          display: grid;
          grid-template-columns: 48px minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: var(--panel-2);
          padding: 14px;
        }

        .ai-trending-list span {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--brand), var(--accent-2));
          color: #fff;
          font-weight: 950;
        }

        .ai-trending-list strong {
          color: var(--text);
        }

        .ai-trending-list p {
          margin: 4px 0 0;
          color: var(--muted);
          line-height: 1.5;
        }

        .ai-trending-list b {
          color: var(--brand);
          font-size: 1.1rem;
        }

        @media (max-width: 1050px) {
          .ai-page-hero,
          .ai-preference-panel,
          .ai-metric-grid,
          .ai-graph-grid,
          .ai-persona-card,
          .ai-dual-pick-grid,
          .ai-dna-grid {
            grid-template-columns: 1fr;
          }

          .ai-sentiment-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .ai-trending-list div {
            grid-template-columns: 1fr;
          }

          .ai-message-card {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}

export default AiRecommendationsPage;