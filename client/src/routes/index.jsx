import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import CollectionPage from '../pages/CollectionPage'
import ProductPage from '../pages/ProductPage'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import OrderSuccessPage from '../pages/OrderSuccessPage'
import OrdersPage from '../pages/OrdersPage'
import OrderDetailPage from '../pages/OrderDetailPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ProfilePage from '../pages/ProfilePage'
import WishlistPage from '../pages/WishlistPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import ContactPage from '../pages/ContactPage'
import NotFoundPage from '../pages/NotFoundPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/collection" element={<CollectionPage />} />
      <Route path="/product/:slug" element={<ProductPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-success/:id" element={<OrderSuccessPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/order/:id" element={<OrderDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/forgot-password" element={<ResetPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
