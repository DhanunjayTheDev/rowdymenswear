const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, wishlistController.getWishlist);
router.post('/', requireAuth, wishlistController.addToWishlist);
router.delete('/:productId', requireAuth, wishlistController.removeFromWishlist);

module.exports = router;
