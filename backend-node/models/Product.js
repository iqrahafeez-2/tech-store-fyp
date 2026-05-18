const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['mobiles', 'laptops', 'gaming', 'accessories', 'smart-devices', 'hardware'],
    },
    brand: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 0, min: 0 },
    images: [{ type: String }],
    icon: { type: String, default: '💻' },
    specs: { type: Map, of: String, default: {} },
    tags: [{ type: String }],
    ratings: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    aiScore: { type: Number, default: 0 },
    sentiment: {
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
    },
    isFeatured: { type: Boolean, default: false },
    isDeal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
