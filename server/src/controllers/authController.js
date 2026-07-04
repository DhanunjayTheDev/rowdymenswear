const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../config/mailer');

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const OTP_TTL_MS = 10 * 60 * 1000;
const pendingRegistrations = new Map();

exports.sendRegisterOtp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    pendingRegistrations.set(email, { name, email, password, otp, expiresAt: Date.now() + OTP_TTL_MS });

    console.log(`\n[OTP] Registration OTP for ${email}: ${otp} (valid 10 min)\n`);

    res.json({ message: 'OTP sent' });
  } catch (error) {
    next(error);
  }
};

exports.verifyRegisterOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const pending = pendingRegistrations.get(email);
    if (!pending || pending.expiresAt < Date.now()) {
      pendingRegistrations.delete(email);
      return res.status(400).json({ message: 'OTP expired, please request a new one' });
    }
    if (pending.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      pendingRegistrations.delete(email);
      return res.status(409).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name: pending.name, email: pending.email, passwordHash: pending.password });
    pendingRegistrations.delete(email);
    const token = createToken(user._id);
    setTokenCookie(res, token);
    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name, email, passwordHash: password });
    const token = createToken(user._id);
    setTokenCookie(res, token);
    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated. Contact support for help.' });
    }
    const token = createToken(user._id);
    setTokenCookie(res, token);
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.avatar) updates.avatar = req.body.avatar;
    if (req.body.addresses) updates.addresses = req.body.addresses;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.passwordHash = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account with that email' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - Rowdy mens Wear',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    });
    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    user.passwordHash = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
