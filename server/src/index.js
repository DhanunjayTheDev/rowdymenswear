require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./config/socket');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const wishlistRoutes = require('./routes/wishlist');
const reviewRoutes = require('./routes/reviews');
const couponRoutes = require('./routes/coupons');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const orderController = require('./controllers/orderController');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(morgan('dev'));

app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.ADMIN_URL].filter(Boolean),
  credentials: true,
}));
app.use(cookieParser());

app.post('/api/orders/stripe-webhook', express.raw({ type: 'application/json' }), orderController.handleStripeWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
