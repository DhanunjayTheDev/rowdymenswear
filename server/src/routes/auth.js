const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, authController.register);

router.post('/register/send-otp', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, authController.sendRegisterOtp);

router.post('/register/verify-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('Enter the 6-digit OTP'),
], validate, authController.verifyRegisterOtp);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, authController.login);

router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);
router.put('/profile', requireAuth, authController.updateProfile);
router.put('/change-password', requireAuth, authController.changePassword);
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
], validate, authController.forgotPassword);
router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, authController.resetPassword);

module.exports = router;
