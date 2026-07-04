const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/auth');

router.get('/product/:productId', reviewController.getProductReviews);
router.post('/product/:productId', requireAuth, reviewController.addReview);
router.put('/:id', requireAuth, reviewController.updateReview);
router.delete('/:id', requireAuth, reviewController.deleteReview);

module.exports = router;
