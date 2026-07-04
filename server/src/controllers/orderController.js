const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { razorpay, stripe } = require('../config/payment');
const { paginate, paginationResult } = require('../utils/pagination');
const { notify } = require('../utils/notify');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `${product ? product.name : 'Product'} not available` });
      }
      const sizeStock = product.sizes.find(s => s.size === item.size);
      if (!sizeStock || sizeStock.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name} (size ${item.size})` });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        size: item.size,
        quantity: item.quantity,
        price: product.salePrice,
      });
      subtotal += product.salePrice * item.quantity;
    }

    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!coupon) return res.status(400).json({ message: 'Invalid coupon code' });
      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validTo) {
        return res.status(400).json({ message: 'Coupon has expired' });
      }
      if (subtotal < coupon.minOrderAmount) {
        return res.status(400).json({ message: `Minimum order amount is ₹${coupon.minOrderAmount}` });
      }
      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Coupon usage limit reached' });
      }
      if (coupon.discountType === 'PERCENT') {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscountValue > 0) discount = Math.min(discount, coupon.maxDiscountValue);
      } else {
        discount = coupon.value;
      }
      appliedCoupon = coupon;
    }

    const shippingCost = subtotal >= 499 ? 0 : 49;
    const total = Math.max(0, subtotal - discount + shippingCost);

    const orderData = {
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        pincode: shippingAddress.pincode,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
      },
      paymentMethod,
      subtotal,
      discount,
      couponCode: couponCode || undefined,
      shippingCost,
      total,
    };

    if (paymentMethod === 'COD') {
      const order = await Order.create(orderData);
      for (const item of items) {
        await Product.updateOne(
          { _id: item.product, 'sizes.size': item.size },
          { $inc: { 'sizes.$.stock': -item.quantity, totalSold: item.quantity } }
        );
      }
      if (appliedCoupon) {
        await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });
      }
      notify('order:new', `New order from ${req.user.name}`, {
        link: '/admin/orders',
        orderId: order._id.toString(),
        shortId: order._id.toString().slice(-8).toUpperCase(),
        customerName: req.user.name,
        total: order.total,
      });
      return res.status(201).json({ order, paymentRequired: false });
    }

    if (paymentMethod === 'ONLINE') {
      const order = await Order.create({ ...orderData, paymentStatus: 'PENDING' });
      const gateway = req.body.gateway || 'razorpay';

      if (gateway === 'razorpay') {
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(total * 100),
          currency: 'INR',
          receipt: order._id.toString(),
        });
        order.razorpayOrderId = razorpayOrder.id;
        order.paymentGateway = 'razorpay';
        await order.save();

        return res.status(201).json({
          order,
          paymentRequired: true,
          gateway: 'razorpay',
          razorpayOrderId: razorpayOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          amount: Math.round(total * 100),
        });
      }

      if (gateway === 'stripe') {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: orderItems.map(item => ({
            price_data: {
              currency: 'inr',
              product_data: { name: item.name },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          })),
          mode: 'payment',
          success_url: `${process.env.CLIENT_URL}/order/${order._id}?success=true`,
          cancel_url: `${process.env.CLIENT_URL}/checkout?canceled=true`,
          metadata: { orderId: order._id.toString() },
        });
        order.stripePaymentIntentId = session.payment_intent;
        order.paymentGateway = 'stripe';
        await order.save();
        return res.status(201).json({
          order,
          paymentRequired: true,
          gateway: 'stripe',
          sessionId: session.id,
          url: session.url,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const crypto = require('crypto');
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentStatus = 'PAID';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product, 'sizes.size': item.size },
        { $inc: { 'sizes.$.stock': -item.quantity, totalSold: item.quantity } }
      );
    }

    notify('order:new', `New order from ${req.user.name}`, {
      link: '/admin/orders',
      orderId: order._id.toString(),
      shortId: order._id.toString().slice(-8).toUpperCase(),
      customerName: req.user.name,
      total: order.total,
    });

    res.json({ order, message: 'Payment verified' });
  } catch (error) {
    next(error);
  }
};

exports.handleStripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const order = await Order.findById(session.metadata.orderId).populate('user', 'name');
      if (order) {
        order.paymentStatus = 'PAID';
        order.stripePaymentIntentId = session.payment_intent;
        await order.save();
        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.product, 'sizes.size': item.size },
            { $inc: { 'sizes.$.stock': -item.quantity, totalSold: item.quantity } }
          );
        }
        notify('order:new', `New order from ${order.user?.name || 'a customer'}`, {
          link: '/admin/orders',
          orderId: order._id.toString(),
          shortId: order._id.toString().slice(-8).toUpperCase(),
          customerName: order.user?.name || 'Customer',
          total: order.total,
        });
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const filter = { user: req.user._id };
    if (req.query.status) filter.orderStatus = req.query.status;
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, pagination: paginationResult(total, page, limit) });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ order });
  } catch (error) {
    next(error);
  }
};

exports.requestReturn = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (order.orderStatus !== 'DELIVERED') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }
    order.returnRequested = true;
    order.returnReason = reason;
    await order.save();
    res.json({ order, message: 'Return requested' });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, pagination: paginationResult(total, page, limit) });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, refundProcessed } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { ...(orderStatus && { orderStatus }), ...(refundProcessed !== undefined && { refundProcessed }) },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (orderStatus === 'CANCELLED' && order.paymentStatus === 'PAID') {
      order.paymentStatus = 'REFUNDED';
      await order.save();
    }
    notify('order:updated', `Order #${order._id.toString().slice(-8).toUpperCase()} ${orderStatus ? `marked ${orderStatus}` : 'updated'}`, { link: '/admin/orders' });
    res.json({ order });
  } catch (error) {
    next(error);
  }
};
