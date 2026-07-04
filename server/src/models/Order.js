const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  size: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    phone: String,
    pincode: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
  },
  paymentMethod: { type: String, enum: ['COD', 'ONLINE'], required: true },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
  },
  orderStatus: {
    type: String,
    enum: ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PLACED',
  },
  paymentGateway: { type: String, enum: ['razorpay', 'stripe', null], default: null },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  stripePaymentIntentId: String,
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: String,
  shippingCost: { type: Number, default: 0 },
  total: { type: Number, required: true },
  returnRequested: { type: Boolean, default: false },
  returnReason: String,
  refundProcessed: { type: Boolean, default: false },
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
