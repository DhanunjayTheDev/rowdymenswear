const Coupon = require('../models/Coupon');
const { notify } = require('../utils/notify');

exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (error) {
    next(error);
  }
};

exports.getCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ coupon });
  } catch (error) {
    next(error);
  }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create({
      ...req.body,
      code: req.body.code.toUpperCase(),
    });
    notify('coupon:created', `Coupon "${coupon.code}" created`, { link: '/admin/coupons' });
    res.status(201).json({ coupon });
  } catch (error) {
    next(error);
  }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    notify('coupon:updated', `Coupon "${coupon.code}" updated`, { link: '/admin/coupons' });
    res.json({ coupon });
  } catch (error) {
    next(error);
  }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    notify('coupon:deleted', `Coupon "${coupon.code}" deleted`, { link: '/admin/coupons' });
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};

exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal, productIds, categoryIds } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(400).json({ valid: false, message: 'Invalid coupon code' });
    }
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      return res.status(400).json({ valid: false, message: 'Coupon has expired' });
    }
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({ valid: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}` });
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ valid: false, message: 'Coupon usage limit reached' });
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENT') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscountValue > 0) discount = Math.min(discount, coupon.maxDiscountValue);
    } else {
      discount = coupon.value;
    }

    res.json({
      valid: true,
      coupon,
      discount: Math.round(discount),
      description: coupon.description,
    });
  } catch (error) {
    next(error);
  }
};
