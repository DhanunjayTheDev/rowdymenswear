import { useDispatch, useSelector } from 'react-redux'
import { addToCart, updateQuantity, removeFromCart, clearCart } from '../store/cartSlice'

export default function useCart() {
  const dispatch = useDispatch()
  const items = useSelector(s => s.cart.items)
  const coupon = useSelector(s => s.cart.coupon)
  const discount = useSelector(s => s.cart.discount)

  const subtotal = items.reduce((sum, i) => sum + i.product.salePrice * i.quantity, 0)
  const shippingCost = subtotal >= 499 ? 0 : 49
  const total = Math.max(0, subtotal - discount + shippingCost)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const add = (product, size, quantity = 1) => dispatch(addToCart({ product, size, quantity }))
  const update = (productId, size, quantity) => dispatch(updateQuantity({ productId, size, quantity }))
  const remove = (productId, size) => dispatch(removeFromCart({ productId, size }))
  const clear = () => dispatch(clearCart())

  return { items, subtotal, shippingCost, discount, total, itemCount, coupon, add, update, remove, clear }
}
