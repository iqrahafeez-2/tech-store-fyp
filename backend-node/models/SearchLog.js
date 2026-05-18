const mongoose = require('mongoose');

const SearchLogSchema = new mongoose.Schema(
  {
    query: { type: String, required: true, index: true },
    category: { type: String, default: 'all' },
    brand: { type: String, default: 'all' },
    resultCount: { type: Number, default: 0 },
    providersUsed: [{ type: String }],
    userId: { type: String, default: 'guest' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SearchLog || mongoose.model('SearchLog', SearchLogSchema);
