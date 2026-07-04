const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAdmin } = require('../middleware/auth');
const { upload, uploadImages } = require('../middleware/upload');

router.get('/', productController.getProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProduct);
router.post('/', requireAdmin, upload.array('images', 10), uploadImages, productController.createProduct);
router.put('/:id', requireAdmin, upload.array('images', 10), uploadImages, productController.updateProduct);
router.delete('/:id', requireAdmin, productController.deleteProduct);
router.post('/upload-images', requireAdmin, upload.array('images', 10), uploadImages, productController.uploadImages);

module.exports = router;
