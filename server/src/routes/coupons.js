const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { requireAdmin } = require('../middleware/auth');

router.get('/', requireAdmin, couponController.getCoupons);
router.get('/:id', requireAdmin, couponController.getCoupon);
router.post('/', requireAdmin, couponController.createCoupon);
router.put('/:id', requireAdmin, couponController.updateCoupon);
router.delete('/:id', requireAdmin, couponController.deleteCoupon);
router.post('/validate', couponController.validateCoupon);

module.exports = router;
