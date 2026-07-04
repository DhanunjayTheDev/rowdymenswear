const Category = require('../models/Category');
const slugify = require('../utils/slugify');
const { notify } = require('../utils/notify');
const { deleteCloudinaryImages } = require('../utils/cloudinaryCleanup');

exports.getCategories = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.active === 'true') filter.isActive = true;
    const categories = await Category.find(filter).sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ category });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const image = req.imageUrl || req.body.image || '';
    const category = await Category.create({ name, slug: slugify(name), description, image });
    notify('category:created', `Category "${category.name}" created`, { link: '/admin/categories' });
    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const existing = await Category.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Category not found' });

    const updates = {};
    if (req.body.name) { updates.name = req.body.name; updates.slug = slugify(req.body.name); }
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.imageUrl) updates.image = req.imageUrl;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive === true || req.body.isActive === 'true';
    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    if (req.imageUrl && existing.image && existing.image !== req.imageUrl) {
      await deleteCloudinaryImages([existing.image]);
    }

    notify('category:updated', `Category "${category.name}" updated`, { link: '/admin/categories' });
    res.json({ category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await deleteCloudinaryImages([category.image]);
    notify('category:deleted', `Category "${category.name}" deleted`, { link: '/admin/categories' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
