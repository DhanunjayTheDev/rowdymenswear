const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/', requireAuth, orderController.createOrder);
router.post('/verify-payment', requireAuth, orderController.verifyPayment);
router.get('/my-orders', requireAuth, orderController.getUserOrders);
router.get('/all', requireAdmin, orderController.getAllOrders);
router.get('/:id', requireAuth, orderController.getOrder);
router.put('/:id/status', requireAdmin, orderController.updateOrderStatus);
router.post('/:id/return', requireAuth, orderController.requestReturn);

module.exports = router;
