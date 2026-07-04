const Product = require('../models/Product');
const Review = require('../models/Review');
const { assignProductSlugs } = require('../utils/uniqueSlug');
const { paginate, paginationResult } = require('../utils/pagination');
const { notify } = require('../utils/notify');
const { deleteCloudinaryImages } = require('../utils/cloudinaryCleanup');

exports.getProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const filter = { isActive: true };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.tags) {
      filter.tags = { $in: req.query.tags.split(',') };
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.salePrice = {};
      if (req.query.minPrice) filter.salePrice.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.salePrice.$lte = Number(req.query.maxPrice);
    }
    if (req.query.size) {
      filter['sizes'] = { $elemMatch: { size: req.query.size.toUpperCase(), stock: { $gt: 0 } } };
    }
    if (req.query.color) filter.color = req.query.color;
    if (req.query.fit) filter.fit = req.query.fit;
    if (req.query.fabric) filter.fabric = req.query.fabric;
    if (req.query.admin === 'true') {
      delete filter.isActive;
    }

    let sort = {};
    switch (req.query.sort) {
      case 'price_asc': sort.salePrice = 1; break;
      case 'price_desc': sort.salePrice = -1; break;
      case 'newest': sort.createdAt = -1; break;
      case 'popularity': sort.totalSold = -1; break;
      case 'rating': sort.averageRating = -1; break;
      default: sort.createdAt = -1;
    }

    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({ products, pagination: paginationResult(total, page, limit) });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (error) {
    next(error);
  }
};

exports.getProductBySlug = async (req, res, next) => {
  try {
    let product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
    let activeVariantId = null;

    if (!product) {
      product = await Product.findOne({ 'variants.slug': req.params.slug }).populate('category', 'name slug');
      if (product) {
        const variant = product.variants.find(v => v.slug === req.params.slug);
        activeVariantId = variant ? variant._id.toString() : null;
      }
    }

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product, activeVariantId });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.sizes && typeof data.sizes === 'string') {
      data.sizes = JSON.parse(data.sizes);
    }
    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim());
    }
    if (data.customAttributes && typeof data.customAttributes === 'string') {
      data.customAttributes = JSON.parse(data.customAttributes);
    }
    if (data.variants && typeof data.variants === 'string') {
      data.variants = JSON.parse(data.variants);
    }
    let existingImages = [];
    if (data.existingImages && typeof data.existingImages === 'string') {
      existingImages = JSON.parse(data.existingImages);
    }
    delete data.existingImages;
    data.images = [...existingImages, ...(req.imageUrls || [])];

    const { slug, variants } = await assignProductSlugs({ name: data.name, variants: data.variants || [] });
    data.slug = slug;
    data.variants = variants;

    const product = await Product.create(data);
    notify('product:created', `Product "${product.name}" created`, { link: '/admin/products' });
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    const data = { ...req.body };
    if (data.sizes && typeof data.sizes === 'string') {
      data.sizes = JSON.parse(data.sizes);
    }
    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim());
    }
    if (data.customAttributes && typeof data.customAttributes === 'string') {
      data.customAttributes = JSON.parse(data.customAttributes);
    }
    if (data.variants && typeof data.variants === 'string') {
      data.variants = JSON.parse(data.variants);
    }
    let existingImages = [];
    if (data.existingImages && typeof data.existingImages === 'string') {
      existingImages = JSON.parse(data.existingImages);
    }
    if (data.existingImages !== undefined) {
      data.images = [...existingImages, ...(req.imageUrls || [])];
    } else if (req.imageUrls && req.imageUrls.length > 0) {
      data.images = req.imageUrls;
    }
    delete data.existingImages;

    // Only regenerate slugs on a full form save (name present). Partial updates like the
    // isActive toggle send neither name nor variants — leave both untouched in that case.
    if (data.name !== undefined) {
      const { slug, variants } = await assignProductSlugs({
        name: data.name,
        variants: data.variants !== undefined ? data.variants : (existing.variants || []),
        productId: existing._id,
      });
      data.slug = slug;
      data.variants = variants;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const oldImages = [...(existing.images || []), ...((existing.variants || []).flatMap(v => v.images || []))];
    const newImages = [...(product.images || []), ...((product.variants || []).flatMap(v => v.images || []))];
    const removedImages = oldImages.filter(url => !newImages.includes(url));
    await deleteCloudinaryImages(removedImages);

    notify('product:updated', `Product "${product.name}" updated`, { link: '/admin/products' });
    res.json({ product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await Review.deleteMany({ product: req.params.id });

    const allImages = [...(product.images || []), ...((product.variants || []).flatMap(v => v.images || []))];
    await deleteCloudinaryImages(allImages);

    notify('product:deleted', `Product "${product.name}" deleted`, { link: '/admin/products' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.imageUrls || req.imageUrls.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const urls = req.imageUrls;
    res.json({ images: urls });
  } catch (error) {
    next(error);
  }
};
