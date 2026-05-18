const mongoose = require('mongoose');

const ProductCacheSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true, index: true },
    source: { type: String, required: true, index: true },
    externalId: { type: String, required: true },
    title: { type: String, required: true, index: 'text' },
    description: { type: String, default: '' },
    category: { type: String, default: 'Technology', index: true },
    brand: { type: String, default: 'Unknown', index: true },
    price: { type: Number, default: null, index: true },
    currency: { type: String, default: 'USD' },
    rating: { type: Number, default: null },
    reviewCount: { type: Number, default: 0 },
    availability: { type: String, default: 'Check seller' },
    image: { type: String, default: '' },
    images: [{ type: String }],
    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
    reviews: [{ type: mongoose.Schema.Types.Mixed }],
    productUrl: { type: String, default: '' },
    sourcePayload: { type: mongoose.Schema.Types.Mixed, default: {} },
    searchKeywords: [{ type: String }],
    cachedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ProductCache || mongoose.model('ProductCache', ProductCacheSchema);
