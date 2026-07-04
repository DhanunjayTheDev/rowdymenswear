const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { requireAdmin } = require('../middleware/auth');
const { upload, uploadSingleImage } = require('../middleware/upload');

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', requireAdmin, upload.single('image'), uploadSingleImage, categoryController.createCategory);
router.put('/:id', requireAdmin, upload.single('image'), uploadSingleImage, categoryController.updateCategory);
router.delete('/:id', requireAdmin, categoryController.deleteCategory);

module.exports = router;
