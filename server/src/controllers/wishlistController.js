const Wishlist = require('../models/Wishlist');

const WISHLIST_POPULATE = 'name slug salePrice mrp images sizes averageRating totalReviews offerPercent isActive';

exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products', WISHLIST_POPULATE);
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    res.json({ wishlist });
  } catch (error) {
    next(error);
  }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
    } else if (wishlist.products.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    } else {
      wishlist.products.push(productId);
      await wishlist.save();
    }
    await wishlist.populate('products', WISHLIST_POPULATE);
    res.json({ wishlist });
  } catch (error) {
    next(error);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
    wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
    await wishlist.save();
    await wishlist.populate('products', WISHLIST_POPULATE);
    res.json({ wishlist });
  } catch (error) {
    next(error);
  }
};
