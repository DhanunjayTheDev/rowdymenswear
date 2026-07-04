const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const { notify } = require('../utils/notify');

exports.getDashboard = async (req, res, next) => {
  try {
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      ordersByStatus,
      paymentMethodBreakdown,
      topProducts,
      topCategories,
      recentOrders,
      revenueByMonth,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'categories',
            localField: 'product.category',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            totalSold: 1,
            revenue: 1,
            productName: '$product.name',
            categoryName: '$category.name',
          },
        },
      ]),
      Order.aggregate([
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'categories',
            localField: 'product.category',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$category.name',
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            unitsSold: { $sum: '$items.quantity' },
          },
        },
        { $match: { _id: { $ne: null } } },
        { $sort: { revenue: -1 } },
        { $limit: 8 },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email'),
      Order.aggregate([
        { $match: { paymentStatus: 'PAID' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const avgOrderValue = totalRevenue.length > 0 && totalOrders > 0
      ? totalRevenue[0].total / totalOrders : 0;

    res.json({
      totalOrders,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      totalCustomers,
      averageOrderValue: Math.round(avgOrderValue),
      ordersByStatus,
      paymentMethodBreakdown,
      topProducts,
      topCategories,
      recentOrders,
      revenueByMonth,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'customer' })
      .select('name email avatar isActive createdAt')
      .sort({ createdAt: -1 });

    const usersWithOrders = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ user: user._id });
        return { ...user.toJSON(), orderCount };
      })
    );

    res.json({ users: usersWithOrders });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'customer' });
    if (!user) return res.status(404).json({ message: 'Customer not found' });
    const orderCount = await Order.countDocuments({ user: user._id });
    res.json({ user: { ...user.toJSON(), orderCount } });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, isActive } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({
      name, email, passwordHash: password || Math.random().toString(36).slice(2),
      isActive: isActive !== undefined ? isActive : true,
    });
    notify('customer:created', `Customer "${user.name}" added`, { link: '/admin/users' });
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.email !== undefined) updates.email = req.body.email;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
    const user = await User.findOneAndUpdate({ _id: req.params.id, role: 'customer' }, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'Customer not found' });
    notify('customer:updated', `Customer "${user.name}" updated`, { link: '/admin/users' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: 'customer' });
    if (!user) return res.status(404).json({ message: 'Customer not found' });
    notify('customer:deleted', `Customer "${user.name}" removed`, { link: '/admin/users' });
    res.json({ message: 'Customer removed' });
  } catch (error) {
    next(error);
  }
};
