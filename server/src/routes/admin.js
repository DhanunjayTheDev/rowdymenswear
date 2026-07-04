const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const notificationController = require('../controllers/notificationController');
const { requireAdmin } = require('../middleware/auth');

router.get('/dashboard', requireAdmin, adminController.getDashboard);

router.get('/users', requireAdmin, adminController.getUsers);
router.post('/users', requireAdmin, adminController.createUser);
router.get('/users/:id', requireAdmin, adminController.getUser);
router.put('/users/:id', requireAdmin, adminController.updateUser);
router.delete('/users/:id', requireAdmin, adminController.deleteUser);

router.get('/notifications', requireAdmin, notificationController.getNotifications);
router.get('/notifications/unread-count', requireAdmin, notificationController.getUnreadCount);
router.put('/notifications/read-all', requireAdmin, notificationController.markAllAsRead);
router.delete('/notifications/bulk', requireAdmin, notificationController.deleteNotifications);
router.put('/notifications/:id/read', requireAdmin, notificationController.markAsRead);
router.delete('/notifications/:id', requireAdmin, notificationController.deleteNotification);

module.exports = router;
