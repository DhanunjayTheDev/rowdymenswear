const mongoose = require('mongoose');

const sizeStockSchema = new mongoose.Schema({
  size: { type: String, required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
}, { _id: false });

const customAttributeSchema = new mongoose.Schema({
  key: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true },
}, { _id: false });

// Each color variant gets its own slug/images/stock, sharing the parent product's
// name, price, category, fit, fabric and description.
const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  colorHex: { type: String, default: '' },
  slug: { type: String, required: true },
  images: [{ type: String }],
  sizes: [sizeStockSchema],
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  mrp: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, required: true, min: 0 },
  offerPercent: { type: Number, default: 0, min: 0, max: 100 },
  sizes: [sizeStockSchema],
  color: { type: String, default: '' },
  colorHex: { type: String, default: '' },
  fit: { type: String, default: '' },
  fabric: { type: String, default: '' },
  tags: [{ type: String }],
  customAttributes: [customAttributeSchema],
  variants: [variantSchema],
  isActive: { type: Boolean, default: true },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalSold: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ salePrice: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'variants.slug': 1 }, { unique: true, sparse: true });

productSchema.pre('save', function () {
  if (this.mrp > 0) {
    this.offerPercent = Math.round(((this.mrp - this.salePrice) / this.mrp) * 100);
  }
});

module.exports = mongoose.model('Product', productSchema);
